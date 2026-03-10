#!/bin/bash

# Extraemos el host y el puerto de la URL o usamos los nombres de los servicios
DB_HOST="db"
DB_PORT="5432"

echo "Esperando a PostgreSQL en $DB_HOST:$DB_PORT..."

# pg_isready es la utilidad oficial de Postgres para esto
while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER"; do
  echo "Postgres no está listo todavía - durmiendo"
  sleep 1
done

echo "Postgres está ARRIBA - ejecutando comando"
exec "$@"