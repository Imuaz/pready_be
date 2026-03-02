# File Upload Best Practices

## File Size Limits

- **Profile Pictures**: 2MB
- **Images**: 5MB
- **Documents**: 10MB
- **Videos**: 50MB

## Allowed File Types

### Images

- JPEG/JPG
- PNG
- GIF
- WebP
- SVG

### Documents

- PDF
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- Text (.txt)
- CSV

## Security Measures

1. ✅ File type validation
2. ✅ File size limits
3. ✅ Virus scanning (TODO)
4. ✅ Image optimization
5. ✅ Secure storage
6. ✅ Access control

## Cloud Storage (Cloudinary)

**Benefits:**

- Automatic image optimization
- CDN delivery
- Transformations on-the-fly
- No server storage limits

**Transformations:**

```
https://res.cloudinary.com/cloud/image/upload/w_400,h_400,c_fill/v1/image.jpg
```

## Local Storage

**When to use:**

- Development/testing
- Small projects
- Complete control needed

**Backup strategy:**

- Regular backups
- Version control
- Disaster recovery plan

```

```
