# PROYECTO 1 – Mini Blog Web Application (Based on LAB5)

This project was developed for the course **Tecnologías y Sistemas Web** and corresponds to **Proyecto 1**, which is an extension and improvement of **Laboratory 5**.

The objective of this project was to build a more complete web application using **HTML, CSS, and JavaScript**, integrating **API consumption**, **DOM manipulation**, and **UI state management**.

The application simulates a **mini blog system with basic user interaction**, allowing users to create, view, edit, and delete posts dynamically.

---

## Project Description

This application allows users to:

- View posts retrieved from an external API
- Search posts by:
  - ID
  - Text
- Create new posts
- Edit existing posts
- Delete posts
- Simulate a basic user session (local)
- Interact with a dynamic interface without reloading the page

The system combines **external API data** with **locally managed data during runtime**.

---

## API Integration

The following endpoints from DummyJSON were used:

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/posts` | Retrieve a list of posts |
| GET | `/posts/search?q=` | Search posts by text |
| GET | `/posts/{id}` | Retrieve a specific post by ID |
| POST | `/posts/add` | Create a new post |

### Important Notes

- The API **does not persist created posts**
- Created posts exist only during execution (runtime)
- Refreshing the page resets locally created data

---

## UI States Implemented

The application handles the following UI states:

- **Idle** → Default state when content is displayed  
- **Loading** → When fetching data from the API  
- **Success** → When posts are successfully loaded or modified  
- **Empty** → When no results are found  
- **Error** → When an API request fails  

Each state provides clear **visual feedback to the user**.

---

## Features Implemented

The following features were implemented:

- Dynamic post feed rendering using DOM manipulation  
- Search functionality (by ID and text)  
- Post creation with validation  
- Post editing functionality  
- Post deletion functionality  
- Real-time UI updates without page reload  
- Scroll limited to the posts container  
- Clean and structured layout  

---

## User System (Local)

The application includes a simple **local user system**:

- Username input (login simulation)  
- User required to create posts  
- Username persists only during the session  
- Posts are associated with the current user  

---

## Visual Features Implemented

The following UI/UX features were implemented:

- Minimalist design  
- Rounded UI components  
- Consistent color palette (blue accents)  
- Card-based post layout  
- Centered content with controlled width  
- Smooth transitions and interactions  
- Scroll only inside the posts container  

---

## How to Run Locally

This project does not require a server or additional setup.

1. Clone the repository:

```bash
git clone <repo-url>

---

## Technologies Used

- HTML  
- CSS  
- JavaScript  
- Fetch API  
- DummyJSON API  
---

## Author

- Student: Miguel Rosas – 241274
- Student: Samuel Robledo - 241282
- Course: Tecnologías y Sistemas Web  
- Year: 2026  

---

## Video

Video demonstration:  https://youtu.be/xbWqGXDq2vo

