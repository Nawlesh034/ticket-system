package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	_ "modernc.org/sqlite"

	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type Ticket struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	UserID      string `json:"user_id"`
}

type StatusRequest struct {
	Status string `json:"status"`
}

// var users []User
var jwt_secret = []byte(os.Getenv("JWT_SECRET"))
var db *sql.DB

func main() {

	fmt.Println("ticket system running")
	db = initDB()
	defer db.Close()
	createTables()
	checkUsers()
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "https://ticket-system-jmdy.onrender.com"},
		AllowMethods: []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))
	router.GET("/health", health)
	router.POST("/auth/register", register)
	router.POST("/auth/login", login)
	router.POST("/tickets", authMiddleware(), createTicket)
	router.GET("/tickets", authMiddleware(), getTickets)
	router.GET("/tickets/:id", authMiddleware(), getTicket)
	router.PATCH("/tickets/:id/status", authMiddleware(), updateStatus)
	fmt.Println("server is running")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	err := router.Run(":" + port)
	if err != nil {
		fmt.Println("server failed", err)
	}

}

func health(g *gin.Context) {
	g.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})

}

func register(g *gin.Context) {
	var user User
	err := g.ShouldBindJSON(&user)
	if err != nil {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Request",
		})
		return
	}
	fmt.Println(user.Email, user.Password)
	if user.Email == "" || user.Password == "" {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "email or password required",
		})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		g.JSON(http.StatusInternalServerError, gin.H{
			"error": "internal server error",
		})
		return
	}
	user.Password = string(hashedPassword)
	user.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	_, err = db.Exec(
		"INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
		user.ID,
		user.Name,
		user.Email,
		user.Password,
	)

	if err != nil {
		fmt.Println("DATABASE ERROR:", err)
		g.JSON(http.StatusInternalServerError, gin.H{
			"error":   "could not create user",
			"message": "user existed",
		})
		return
	}
	g.JSON(http.StatusCreated, gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
	})
}

func login(g *gin.Context) {
	var loginData LoginRequest
	err := g.ShouldBindJSON(&loginData)
	if err != nil {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Request",
		})
		return
	}
	if loginData.Email == "" || loginData.Password == "" {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "email or password is missing",
		})
		return
	}
	var user User

	err = db.QueryRow(
		"SELECT id, name, email, password FROM users WHERE email = ?",
		loginData.Email,
	).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
	)
	if err != nil {
		g.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password))
	if err != nil {
		g.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
	})
	fmt.Println(token)
	tokenString, err := token.SignedString(jwt_secret)
	if err != nil {
		g.JSON(http.StatusInternalServerError, gin.H{
			"error": "jwt not generated",
		})
		return
	}

	g.JSON(http.StatusOK, gin.H{
		"token":   tokenString,
		"userid":  user.ID,
		"email":   user.Email,
		"message": "login successfull",
	})
}

func authMiddleware() gin.HandlerFunc {
	return func(g *gin.Context) {

		authHeader := g.GetHeader("Authorization")
		fmt.Println("AUTH HEADER:", authHeader)

		if authHeader == "" {
			g.JSON(http.StatusUnauthorized, gin.H{
				"error": "authorization header required",
			})
			g.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {

			if token.Method != jwt.SigningMethodHS256 {
				return nil, fmt.Errorf("unexpected signing method")
			}

			return jwt_secret, nil
		})

		if err != nil || !token.Valid {
			fmt.Println("JWT ERROR:", err)
			g.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid or expired token",
			})
			g.Abort()
			return
		}

		g.Set("user_id", token.Claims.(jwt.MapClaims)["user_id"])

		g.Next()
	}
}
func initDB() *sql.DB {
	db, err := sql.Open("sqlite", "data/ticket_system.db")

	if err != nil {
		panic(err)
	}

	return db
}
func createTables() {
	query := `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
	CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        user_id TEXT NOT NULL
    );
    `

	_, err := db.Exec(query)

	if err != nil {
		panic(err)
	}
}
func createTicket(g *gin.Context) {

	var ticket Ticket

	err := g.ShouldBindJSON(&ticket)

	if err != nil {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	fmt.Println("Title:", ticket.Title)
	fmt.Println("Description:", ticket.Description)

	if ticket.Title == "" || ticket.Description == "" {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "title and description are required",
		})
		return
	}

	userID, exists := g.Get("user_id")
	fmt.Println("USER ID:", userID)
	fmt.Println("EXISTS:", exists)

	if !exists {
		g.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not authenticated",
		})
		return
	}

	ticket.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	ticket.UserID = userID.(string)
	ticket.Status = "open"

	_, err = db.Exec(
		`INSERT INTO tickets (id, title, description, status, user_id)
         VALUES (?, ?, ?, ?, ?)`,
		ticket.ID,
		ticket.Title,
		ticket.Description,
		ticket.Status,
		ticket.UserID,
	)

	if err != nil {
		g.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not create ticket",
		})
		return
	}

	g.JSON(http.StatusCreated, ticket)
}
func getTickets(g *gin.Context) {

	userID, exists := g.Get("user_id")
	fmt.Println(userID, exists)

	if !exists {
		g.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not authenticated",
		})
		return
	}

	rows, err := db.Query(
		`SELECT id, title, description, status, user_id
         FROM tickets
         WHERE user_id = ?`,
		userID,
	)

	if err != nil {
		g.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not fetch tickets",
		})
		return
	}

	defer rows.Close()

	tickets := []Ticket{}

	for rows.Next() {

		var ticket Ticket

		err := rows.Scan(
			&ticket.ID,
			&ticket.Title,
			&ticket.Description,
			&ticket.Status,
			&ticket.UserID,
		)

		if err != nil {
			g.JSON(http.StatusInternalServerError, gin.H{
				"error": "could not read ticket",
			})
			return
		}

		tickets = append(tickets, ticket)
	}

	g.JSON(http.StatusOK, gin.H{
		"tickets": tickets,
	})
}
func getTicket(g *gin.Context) {

	ticketID := g.Param("id")

	userID, exists := g.Get("user_id")
	if !exists {
		g.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not authenticated",
		})
		return
	}

	var ticket Ticket

	err := db.QueryRow(
		`SELECT id, title, description, status, user_id
         FROM tickets
         WHERE id = ? AND user_id = ?`,
		ticketID,
		userID,
	).Scan(
		&ticket.ID,
		&ticket.Title,
		&ticket.Description,
		&ticket.Status,
		&ticket.UserID,
	)

	if err == sql.ErrNoRows {
		g.JSON(http.StatusNotFound, gin.H{
			"error": "ticket not found",
		})
		return
	}

	if err != nil {
		g.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not fetch ticket",
		})
		return
	}

	g.JSON(http.StatusOK, ticket)
}
func checkUsers() {
	rows, err := db.Query("SELECT id, email FROM users")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		var email string

		rows.Scan(&id, &email)

		fmt.Println("USER:", id, email)
	}
}

func updateStatus(g *gin.Context) {

	ticketID := g.Param("id") // get the ticket id

	userID, exists := g.Get("user_id") // get user id

	if !exists {
		g.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not authenticated",
		})
		return
	}

	var request StatusRequest

	err := g.ShouldBindJSON(&request)

	if err != nil {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	if request.Status != "open" &&
		request.Status != "in_progress" &&
		request.Status != "closed" {

		g.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid status",
		})
		return
	}

	var currentStatus string

	err = db.QueryRow(
		`SELECT status
         FROM tickets
         WHERE id = ? AND user_id = ?`,
		ticketID,
		userID,
	).Scan(&currentStatus)

	if err == sql.ErrNoRows {
		g.JSON(http.StatusNotFound, gin.H{
			"error": "ticket not found",
		})
		return
	}

	if err != nil {
		g.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not fetch ticket",
		})
		return
	}

	if currentStatus == "closed" {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "closed ticket cannot be reopened",
		})
		return
	}

	if currentStatus == "open" && request.Status == "closed" {
		g.JSON(http.StatusBadRequest, gin.H{
			"error": "ticket must move to in_progress before closed",
		})
		return
	}

	_, err = db.Exec(
		`UPDATE tickets
         SET status = ?
         WHERE id = ? AND user_id = ?`,
		request.Status,
		ticketID,
		userID,
	)

	if err != nil {
		g.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not update ticket",
		})
		return
	}

	g.JSON(http.StatusOK, gin.H{
		"message": "ticket status updated",
		"status":  request.Status,
	})
}
