FROM pgvector/pgvector:pg16

# PostGIS ইনস্টল করা (pgvector ইমেজের ওপর ভিত্তি করে)
USER root
RUN apt-get update && \
    apt-get install -y postgresql-16-postgis-3 && \
    rm -rf /var/lib/apt/lists/*