Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

docker run --name test-postgres -d -p 5432:5432 -e POSTGRES_PASSWORD=test postgres

docker exec -it test-postgres psql -U postgres

CREATE DATABASE test;