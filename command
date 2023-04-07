knex migrate:make create_comment_table --knexfile=/app/knexfile.cjs
knex migrate:up --knexfile=/app/knexfile.cjs
docker-compose -f docker-compose.prod.yml up --detach --build  backend_prod

knex migrate:down --knexfile=/app/knexfile.cjs

select * from THREAD where "id" = '126cwsz';