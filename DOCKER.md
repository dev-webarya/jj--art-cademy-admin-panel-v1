# JJ Art Academy - Admin Panel Docker Setup

## Quick Start

### Using Docker Compose (Recommended)

1. **Start the application:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

4. **Rebuild after code changes:**
   ```bash
   docker-compose up -d --build
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t jj-art-admin-panel .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8023:80 --name jj-art-admin-panel jj-art-admin-panel
   ```

## Configuration

The application uses environment variables from the `.env` file:

- `PORT` - External port to expose (default: 8023)
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset

## Access

Once running, access the admin panel at:
- **Local:** http://localhost:8023
- **Network:** http://YOUR_SERVER_IP:8023

## Production Deployment

For production, consider:

1. **Use environment-specific .env files:**
   ```bash
   docker-compose --env-file .env.production up -d
   ```

2. **Enable HTTPS** (recommended):
   - Update `nginx.conf` to redirect HTTP to HTTPS
   - Mount SSL certificates as volumes
   - Update `docker-compose.yml` to expose port 443

3. **Resource limits:**
   ```yaml
   services:
     admin-panel:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

## Troubleshooting

### Container won't start
```bash
docker-compose logs admin-panel
```

### Rebuild from scratch
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Check nginx configuration
```bash
docker exec jj-art-admin-panel nginx -t
```
