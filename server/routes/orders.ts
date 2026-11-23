import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { badRequest, notFound } from "../lib/http-error.js";
import { parseInput } from "../lib/validation.js";

const checkoutSchema = z.object({
	couponCode: z.string().trim().max(40).optional().nullable(),
});

interface Coupon {
	type: "percent" | "fixed";
	value: number;
}

const COUPONS: Record<string, Coupon> = {
	READ10: { type: "percent", value: 10 },
	READVERSE20: { type: "percent", value: 20 },
	SAVE5: { type: "fixed", value: 5 },
};

interface CartRow {
	id: string;
	title: string;
	price: string | number;
	quantity: number;
}

interface OrderRow {
	id: string;
	subtotal: string | number;
	discount: string | number;
	tax: string | number;
	total: string | number;
	coupon_code: string | null;
	status: string;
	created_at: string | Date;
	items?: unknown;
}

const mapOrder = (row: OrderRow) => ({
	id: row.id,
	subtotal: Number(row.subtotal),
	discount: Number(row.discount),
	tax: Number(row.tax),
	total: Number(row.total),
	couponCode: row.coupon_code,
	status: row.status,
	createdAt: new Date(row.created_at).toISOString(),
	items: Array.isArray(row.items)
		? row.items.map((item) => {
				const entry = item as {
					id: string;
					title: string;
					price: string | number;
					quantity: number;
					cover?: string;
				};
				return {
					id: entry.id,
					title: entry.title,
					price: Number(entry.price),
					quantity: entry.quantity,
					cover: entry.cover,
				};
			})
		: [],
});

const round = (value: number) => Math.round(value * 100) / 100;

export default async function orderRoutes(app: FastifyInstance) {
	app.addHook("preHandler", app.authenticate);

	app.post("/", async (request, reply) => {
		const input = parseInput(checkoutSchema, request.body ?? {});

		const couponKey = input.couponCode?.trim().toUpperCase();
		const coupon = couponKey ? COUPONS[couponKey] : undefined;
		if (couponKey && !coupon) {
			throw badRequest("That coupon code is not valid");
		}

		const order = await withTransaction(async (client) => {
			const cart = await client.query<CartRow>(
				`SELECT b.id, b.title, b.price, c.quantity
				 FROM cart_items c JOIN books b ON b.id = c.book_id
				 WHERE c.user_id = $1
				 FOR UPDATE OF c`,
				[request.user.sub],
			);

			if (!cart.rowCount) {
				throw badRequest("Your cart is empty");
			}

			const subtotal = round(cart.rows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));

			let discount = 0;
			if (coupon) {
				discount = coupon.type === "percent" ? round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);
			}

			const tax = 0;
			const total = round(subtotal - discount + tax);

			const inserted = await client.query<OrderRow>(
				`INSERT INTO orders (user_id, subtotal, discount, tax, total, coupon_code)
				 VALUES ($1, $2, $3, $4, $5, $6)
				 RETURNING id, subtotal, discount, tax, total, coupon_code, status, created_at`,
				[request.user.sub, subtotal, discount, tax, total, couponKey ?? null],
			);
			const orderRow = inserted.rows[0];

			for (const item of cart.rows) {
				await client.query(
					`INSERT INTO order_items (order_id, book_id, title, price, quantity)
					 VALUES ($1, $2, $3, $4, $5)`,
					[orderRow.id, item.id, item.title, item.price, item.quantity],
				);

				await client.query(
					`INSERT INTO library (user_id, book_id)
					 VALUES ($1, $2)
					 ON CONFLICT (user_id, book_id) DO NOTHING`,
					[request.user.sub, item.id],
				);
			}

			await client.query("DELETE FROM cart_items WHERE user_id = $1", [request.user.sub]);

			return {
				...mapOrder(orderRow),
				items: cart.rows.map((item) => ({
					id: item.id,
					title: item.title,
					price: Number(item.price),
					quantity: item.quantity,
				})),
			};
		});

		return reply.code(201).send({ order });
	});

	app.get("/", async (request) => {
		const result = await query<OrderRow>(
			`SELECT o.id, o.subtotal, o.discount, o.tax, o.total, o.coupon_code,
			        o.status, o.created_at,
			        COALESCE(
			          json_agg(
			            json_build_object(
			              'id', oi.book_id,
			              'title', oi.title,
			              'price', oi.price,
			              'quantity', oi.quantity,
			              'cover', b.cover
			            ) ORDER BY oi.title
			          ) FILTER (WHERE oi.id IS NOT NULL),
			          '[]'
			        ) AS items
			 FROM orders o
			 LEFT JOIN order_items oi ON oi.order_id = o.id
			 LEFT JOIN books b ON b.id = oi.book_id
			 WHERE o.user_id = $1
			 GROUP BY o.id
			 ORDER BY o.created_at DESC`,
			[request.user.sub],
		);

		return { orders: result.rows.map(mapOrder) };
	});

	app.get("/:orderId", async (request) => {
		const { orderId } = request.params as { orderId: string };
		const result = await query<OrderRow>(
			`SELECT o.id, o.subtotal, o.discount, o.tax, o.total, o.coupon_code,
			        o.status, o.created_at,
			        COALESCE(
			          json_agg(
			            json_build_object(
			              'id', oi.book_id,
			              'title', oi.title,
			              'price', oi.price,
			              'quantity', oi.quantity,
			              'cover', b.cover
			            ) ORDER BY oi.title
			          ) FILTER (WHERE oi.id IS NOT NULL),
			          '[]'
			        ) AS items
			 FROM orders o
			 LEFT JOIN order_items oi ON oi.order_id = o.id
			 LEFT JOIN books b ON b.id = oi.book_id
			 WHERE o.user_id = $1 AND o.id = $2
			 GROUP BY o.id`,
			[request.user.sub, orderId],
		);

		const row = result.rows[0];
		if (!row) throw notFound("Order not found");
		return { order: mapOrder(row) };
	});
}
