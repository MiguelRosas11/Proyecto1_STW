# LAB5 – Mini Blog Web Application with API Integration

This project was developed for the course **Tecnologías y Sistemas Web** and corresponds to **Laboratory 5**.

The objective of this laboratory was to build a small web application using **HTML, CSS, and JavaScript**, integrating **API consumption**, **DOM manipulation**, and proper handling of **UI states**.

The application simulates a **mini blog / bulletin board**, where users can create, view, and search posts.

---

## Project Description

This application allows users to:

- View a list of posts retrieved from a public API
- Search posts by:
  - ID
  - Text (using query parameters)
- Create new posts using a form
- See immediate feedback when performing actions
- Interact with a dynamic interface without reloading the page

The application uses the **DummyJSON API** to simulate real-world API interactions.

---

## API Integration

The following endpoints from DummyJSON were used:

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/posts` | Retrieve a list of posts |
| GET | `/posts/search?q=` | Search posts by text |
| GET | `/posts/{id}` | Retrieve a specific post by ID |
| POST | `/posts/add` | Create a new post |

### Important Note

- The API **does not persist created posts**
- Created posts are stored locally in the application using a temporary array
- This ensures that newly created posts are immediately visible in the UI

---

## UI States Implemented

The application handles the following UI states:

- **Idle** → Default state when content is displayed
- **Loading** → When fetching data from the API
- **Success** → When posts are successfully loaded or created
- **Empty** → When no results are found
- **Error** → When an API request fails

Each state provides **visual feedback to the user**.

---

## Features Implemented

The following features were implemented:

- Mini blog layout with two main panels:
  - Left panel → User profile and post creation
  - Right panel → Search and post feed
- Scroll limited only to the posts container
- Dynamic rendering of posts using DOM manipulation
- Search functionality using query parameters
- Post creation using HTTP POST requests
- Input validation before creating posts
- Persistent username within the session
- Local storage of created posts (temporary)
- Smooth and minimalist UI design

---

## Mini Profile System

The application includes a simple user profile:

- Avatar placeholder (default user icon)
- Username input field
- The username is required to create posts
- The username persists while the session is active
- Only the post message is cleared after publishing

---

## Visual Features Implemented

The following UI/UX features were implemented:

- Minimalist design with soft rounded corners
- Blue accent buttons for consistency
- Centered posts panel with limited width
- Clean card-based layout for posts
- Scroll only inside the posts container
- Responsive spacing and alignment
- Real-time DOM updates without page reload

---

## How to Run Locally

This project does not require a server or additional setup.

1. Download or clone the repository:

   git clone <repo-url>

2. Navigate to the project folder.

3. Open the `index.html` file:

   - Double click the file, or  
   - Right click → Open with browser  

The application will run directly in your browser.


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
- Course: Tecnologías y Sistemas Web  
- Year: 2026  

---

## Video

Video demonstration:  
[https://youtu.be/NNMWfV-7baw](https://www.youtube.com/watch?v=NNMWfV-7baw)
