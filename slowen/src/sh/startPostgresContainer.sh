# Starten eines Postgre-Container als Testdatenbank
docker run -d \
	--name postgres-test \
	-e POSTGRES_PASSWORD=slowen \
	-e POSTGRES_USER=slowen \
	-v ~/pgtest:/var/lib/postgresql/data \
	-p 5432:5432 \
	postgres
