# common dev commands

install:
	cd backend && npm install
	cd frontend && npm install

test:
	cd backend && npm test

start-backend:
	cd backend && npm start

start-frontend:
	cd frontend && npm run dev

docker-up:
	docker compose up

docker-down:
	docker compose down

.PHONY: install test start-backend start-frontend docker-up docker-down
