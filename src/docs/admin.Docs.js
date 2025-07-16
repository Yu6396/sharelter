/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT

 *   schemas:
 *     AdminLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: admin@example.com
 *         password:
 *           type: string
 *           example: strongpassword123

 *     CreateAdmin:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string

 *     ResetPassword:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           example: NewPassword123
 *
 *     UpdateAdmin:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string

 * security:
 *   - bearerAuth: []
 */

/**
 * @openapi
 * /admin/login:
 *   post:
 *     tags:
 *       - Admin Auth
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /admin/create/admin:
 *   post:
 *     tags:
 *       - Admin Management
 *     summary: Create a new admin (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdmin'
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @openapi
 * /admin/get/all/admin:
 *   get:
 *     tags:
 *       - Admin Management
 *     summary: Get all admins (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admins
 */

/**
 * @openapi
 * /admin/get/admin/profile/{admin_id}:
 *   get:
 *     tags:
 *       - Admin Management
 *     summary: Get single admin profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: admin_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin profile returned
 */

/**
 * @openapi
 * /admin/upload/profile/image:
 *   patch:
 *     tags:
 *       - Admin Management
 *     summary: Upload profile image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded
 */

/**
 * @openapi
 * /admin/update/admin/{admin_id}:
 *   patch:
 *     tags:
 *       - Admin Management
 *     summary: Update admin details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: admin_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdmin'
 *     responses:
 *       200:
 *         description: Admin updated
 */

/**
 * @openapi
 * /admin/delete/admin/{admin_id}:
 *   delete:
 *     tags:
 *       - Admin Management
 *     summary: Delete an admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: admin_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin deleted
 */

/**
 * @openapi
 * /admin/get/all/apartment:
 *   get:
 *     tags:
 *       - Apartment Management
 *     summary: Get all apartments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All apartments returned
 */

/**
 * @openapi
 * /admin/get/single/apartment/{apartment_id}:
 *   get:
 *     tags:
 *       - Apartment Management
 *     summary: Get single apartment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: apartment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Apartment returned
 */

/**
 * @openapi
 * /admin/disable/apartment/post/{apartment_id}:
 *   post:
 *     tags:
 *       - Apartment Management
 *     summary: Disable an apartment post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: apartment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Apartment disabled
 */

/**
 * @openapi
 * /admin/enable/apartment/post/{apartment_id}:
 *   post:
 *     tags:
 *       - Apartment Management
 *     summary: Enable an apartment post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: apartment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Apartment enabled
 */

/**
 * @openapi
 * /admin/delete/apartment/{apartment_id}:
 *   delete:
 *     tags:
 *       - Apartment Management
 *     summary: Delete an apartment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: apartment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Apartment deleted
 */
