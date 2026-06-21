# common dev commands

run-backend:
	cd backend && mvn spring-boot:run

run-frontend:
	cd frontend && npm install && npm run dev

test-backend:
	cd backend && mvn test

package-backend:
	cd backend && mvn package -DskipTests

docker-up:
	docker compose up

docker-down:
	docker compose down

.PHONY: run-backend run-frontend test-backend package-backend docker-up docker-down
