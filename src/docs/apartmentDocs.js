/**
 * @swagger
 * tags:
 *   name: Apartments
 *   description: Apartment listing and management
 */

/**
 * @swagger
 * /api/apartment/post:
 *   post:
 *     summary: Post a new apartment
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amenities
 *               - description
 *               - category_type
 *               - address_no
 *               - street
 *               - city
 *               - state
 *               - floor
 *               - no_flatmate
 *               - pet_allowed
 *               - prefered_flatmate
 *               - amount
 *             properties:
 *               type:
 *                 type: string
 *               amenities:
 *                 type: string
 *                 example: ["wifi", "parking"]
 *               description:
 *                 type: string
 *               category_type:
 *                 type: string
 *               address_no:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               floor:
 *                 type: string
 *               no_flatmate:
 *                 type: number
 *               pet_allowed:
 *                 type: boolean
 *               prefered_flatmate:
 *                 type: string
 *               amount:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Apartment created successfully
 *       400:
 *         description: Validation error or upload error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/apartment/get/all:
 *   get:
 *     summary: Get all apartments
 *     tags: [Apartments]
 *     responses:
 *       200:
 *         description: List of all apartments
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/apartment/get/single/{apartment_id}:
 *   get:
 *     summary: Get a single apartment by ID
 *     tags: [Apartments]
 *     parameters:
 *       - in: path
 *         name: apartment_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Apartment data
 *       404:
 *         description: Apartment not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/apartment/delete/{apartment_id}:
 *   delete:
 *     summary: Delete an apartment
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartment_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Apartment deleted successfully
 *       403:
 *         description: Not authorized to delete this apartment
 *       404:
 *         description: Apartment not found
 *       500:
 *         description: Server error
 */
