# 📚 Swagger Documentation Best Practices & Guide

**Version:** 1.0  
**Last Updated:** April 24, 2026

---

## ✅ Current Status

- **Total Endpoints:** 322
- **Documented Endpoints:** Most main endpoints documented ✅
- **Validation Tool:** `scripts/swaggerAudit.js` available

---

## 📋 Swagger Documentation Template

### Basic Endpoint Template

```javascript
/**
 * @swagger
 * /api/v1/resource:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Successfully retrieved resources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/', getResources);
```

---

## 🏗️ Component Structure

### Standard Error Response Schema

```yaml
Error:
  type: object
  properties:
    success:
      type: boolean
      example: false
    message:
      type: string
      example: "Error message"
    statusCode:
      type: integer
      example: 400
```

### Standard Paginated Response

```yaml
PaginatedResponse:
  type: object
  properties:
    success:
      type: boolean
    count:
      type: integer
    total:
      type: integer
    page:
      type: integer
    pages:
      type: integer
    data:
      type: array
      items:
        type: object
```

---

## 🔑 Key Components to Document

### 1. **HTTP Methods**
```javascript
// GET - Retrieve resource
router.get('/resource/:id', getResource);

// POST - Create resource
router.post('/', createResource);

// PUT - Replace entire resource
router.put('/resource/:id', updateResource);

// PATCH - Partial update
router.patch('/resource/:id', partialUpdate);

// DELETE - Remove resource
router.delete('/resource/:id', deleteResource);
```

### 2. **Tags**
Group related endpoints together:
```javascript
@swagger
tags:
  - name: Resources
    description: Operations related to resources
  - name: Announcements
    description: Announcement management
```

### 3. **Security**
Always include authentication info:
```javascript
security:
  - bearerAuth: []  # Requires JWT token
```

### 4. **Parameters**

#### Path Parameters
```javascript
parameters:
  - in: path
    name: id
    required: true
    schema:
      type: string
      format: uuid
    description: Resource ID
```

#### Query Parameters
```javascript
parameters:
  - in: query
    name: page
    schema:
      type: integer
      default: 1
    description: Page number for pagination

  - in: query
    name: search
    schema:
      type: string
    description: Search term
```

#### Request Body
```javascript
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required:
          - name
          - email
        properties:
          name:
            type: string
            example: "John Doe"
          email:
            type: string
            format: email
            example: "john@example.com"
          age:
            type: integer
            minimum: 0
            maximum: 150
```

### 5. **Responses**

```javascript
responses:
  200:
    description: Success
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Resource'
  
  201:
    description: Created
    content:
      application/json:
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              $ref: '#/components/schemas/Resource'
  
  400:
    description: Bad Request - Invalid input
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
  
  401:
    description: Unauthorized - Missing or invalid token
  
  403:
    description: Forbidden - Insufficient permissions
  
  404:
    description: Not Found - Resource doesn't exist
  
  500:
    description: Internal Server Error
```

---

## 📝 Complete Example: Announcement API

```javascript
/**
 * @swagger
 * tags:
 *   - name: Announcements
 *     description: School announcements management
 */

/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     summary: Create a new announcement
 *     description: Admin/Teacher can create announcements visible to students
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: "School Assembly"
 *               message:
 *                 type: string
 *                 maxLength: 5000
 *                 example: "Assembly scheduled at 9:00 AM"
 *               type:
 *                 type: string
 *                 enum: [general, academic, exam, urgent]
 *                 default: general
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               status:
 *                 type: string
 *                 enum: [draft, published, expired]
 *                 default: published
 *               targetType:
 *                 type: string
 *                 enum: [all, class, section, teacher, student, parent]
 *                 default: all
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-30T23:59:59Z"
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Announcement created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Bad Request - Missing required fields
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post('/', createAnnouncement);

/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     summary: Get all announcements
 *     description: Retrieve announcements with filtering and pagination
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, expired]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and message
 *     responses:
 *       200:
 *         description: Successfully retrieved announcements
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAnnouncements);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   get:
 *     summary: Get announcement by ID
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement found
 *       404:
 *         description: Announcement not found
 *   put:
 *     summary: Update announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
router.get('/:id', getAnnouncement);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);
```

---

## ✨ Best Practices

### ✅ DO's

1. **Use Full Paths**
   ```javascript
   @swagger
   * /api/v1/announcements:
   ```

2. **Include All Response Codes**
   - 200 (OK)
   - 201 (Created)
   - 400 (Bad Request)
   - 401 (Unauthorized)
   - 403 (Forbidden)
   - 404 (Not Found)
   - 500 (Server Error)

3. **Use Schema References**
   ```javascript
   schema:
     $ref: '#/components/schemas/Announcement'
   ```

4. **Document Parameters**
   ```javascript
   parameters:
     - in: path|query|header
       name: paramName
       required: true|false
       description: What this parameter does
   ```

5. **Add Examples**
   ```javascript
   example: "Sample value here"
   ```

### ❌ DON'Ts

1. ❌ Don't use relative paths
   ```javascript
   // WRONG
   @swagger
   * /announcements:
   
   // CORRECT
   @swagger
   * /api/v1/announcements:
   ```

2. ❌ Don't forget security requirements
   ```javascript
   // WRONG
   # No security defined
   
   // CORRECT
   security:
     - bearerAuth: []
   ```

3. ❌ Don't skip response documentation
   ```javascript
   // WRONG - Missing error responses
   responses:
     200: ...
   
   // CORRECT
   responses:
     200: ...
     400: ...
     401: ...
     404: ...
   ```

4. ❌ Don't use inconsistent tag names
   ```javascript
   // WRONG
   tags: [Announcement]
   tags: [Announcements]
   tags: [announcement]
   
   // CORRECT
   tags: [Announcements]  # Consistent
   ```

---

## 🔍 Validation Checklist

Before committing API changes:

- [ ] Swagger comments are present
- [ ] Full path is documented (`/api/v1/...`)
- [ ] Summary is descriptive
- [ ] All methods documented (GET, POST, PUT, DELETE)
- [ ] Security is defined
- [ ] All parameters are documented
- [ ] Request body is defined
- [ ] Response schemas are complete
- [ ] Error responses are included
- [ ] Examples are provided where helpful
- [ ] Tags are consistent
- [ ] No syntax errors in YAML

---

## 🚀 Testing Your Documentation

### 1. **Start the Server**
```bash
npm start
```

### 2. **Open Swagger UI**
```
http://localhost:5000/api-docs
```

### 3. **Find Your Endpoint**
- Look for the tag (e.g., Announcements)
- Expand the endpoint
- Check if all fields are showing

### 4. **Test It**
- Click "Try it out"
- Add Bearer token
- Fill in parameters
- Click "Execute"

### 5. **Check Response**
- Verify status code
- Check response body
- Validate against schema

---

## 📊 Audit Script

### Run Audit
```bash
node scripts/swaggerAudit.js
```

### Output
- Shows which endpoints are documented
- Lists undocumented endpoints
- Generates detailed report in `SWAGGER_VALIDATION_REPORT.md`

---

## 🔗 Common Issues & Fixes

### Issue: Endpoint not showing in Swagger UI

**Solutions:**
1. Check if path includes `/api/v1`
2. Verify `@swagger` comment format
3. Ensure no syntax errors in YAML
4. Restart server: `npm start`
5. Clear browser cache

### Issue: "Missing required parameter"

**Solution:**
```javascript
// WRONG
parameters:
  - name: id

// CORRECT
parameters:
  - in: path
    name: id
    required: true
    schema:
      type: string
```

### Issue: Schema not found

**Solution:**
```javascript
// Create schema in swagger.js
components:
  schemas:
    Announcement:
      type: object
      properties: ...

// Reference in endpoint
schema:
  $ref: '#/components/schemas/Announcement'
```

---

## 📚 Resources

- **OpenAPI 3.0 Spec:** https://spec.openapis.org/oas/v3.0.3
- **Swagger JSDoc:** https://github.com/Surnet/swagger-jsdoc
- **Swagger UI:** https://swagger.io/tools/swagger-ui/

---

## 📝 Documentation Maintenance

**Weekly Tasks:**
- [ ] Run audit script to check coverage
- [ ] Document new endpoints immediately
- [ ] Update deprecated endpoints
- [ ] Test in Swagger UI

**Monthly Tasks:**
- [ ] Review and update examples
- [ ] Check for consistency in naming
- [ ] Update error responses if needed
- [ ] Generate full API documentation

---

**Last Updated:** April 24, 2026  
**Swagger Version:** 3.0.0  
**API Version:** v1
