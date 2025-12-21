FROM postgres:16-bullseye

# Install PostGIS and pgvector from the official PGDG repository
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-16-postgis-3 postgresql-16-pgvector \
    && rm -rf /var/lib/apt/lists/*