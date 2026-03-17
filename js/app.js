const API = "https://dummyjson.com/posts";

const postsContainer = document.getElementById("postsContainer");
const uiState = document.getElementById("uiState");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchType = document.getElementById("searchType");
const clearBtn = document.getElementById("clearBtn");

const profileNameInput = document.getElementById("profileNameInput");
const postInput = document.getElementById("postInput");
const publishBtn = document.getElementById("publishBtn");
const createFeedback = document.getElementById("createFeedback");

let localPosts = [];
let searchActive = false;

function showState(message) {
  postsContainer.innerHTML = "";
  uiState.textContent = message;
  uiState.classList.add("visible");
}

function clearState() {
  uiState.textContent = "";
  uiState.classList.remove("visible");
}

function normalizeApiPost(post) {
  return {
    id: post.id,
    author: "Usuario " + post.userId,
    body: post.body
  };
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";

  if (!posts || posts.length === 0) {
    showState("No se encontraron posts");
    return;
  }

  clearState();

  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card";

    const author = document.createElement("div");
    author.className = "post-author";
    author.textContent = post.author;

    const message = document.createElement("div");
    message.textContent = post.body;

    card.appendChild(author);
    card.appendChild(message);

    postsContainer.appendChild(card);
  });
}

async function loadPosts() {
  searchActive = false;
  showState("Cargando posts...");

  try {
    const response = await fetch(API);

    if (!response.ok) {
      throw new Error("Error al cargar posts");
    }

    const data = await response.json();
    const apiPosts = data.posts.map(normalizeApiPost);

    renderPosts([...localPosts, ...apiPosts]);
  } catch (error) {
    showState("Error cargando posts");
  }
}

async function searchPosts() {
  const type = searchType.value;
  const value = searchInput.value.trim();

  if (value === "") {
    searchActive = false;
    loadPosts();
    return;
  }

  searchActive = true;
  showState("Buscando...");

  try {
    if (type === "id") {
      const res = await fetch(`${API}/${encodeURIComponent(value)}`);

      if (!res.ok) {
        renderPosts([]);
        return;
      }

      const post = await res.json();

      const localMatches = localPosts.filter(
        localPost => String(localPost.id) === value
      );

      const apiMatch = {
        id: post.id,
        author: "Usuario " + post.userId,
        body: post.body
      };

      renderPosts([...localMatches, apiMatch]);
      return;
    }

    const res = await fetch(`${API}/search?q=${encodeURIComponent(value)}`);

    if (!res.ok) {
      throw new Error("Error en búsqueda");
    }

    const data = await res.json();

    const apiResults = data.posts.map(normalizeApiPost);

    const localResults = localPosts.filter(post =>
      post.author.toLowerCase().includes(value.toLowerCase()) ||
      post.body.toLowerCase().includes(value.toLowerCase())
    );

    renderPosts([...localResults, ...apiResults]);
  } catch (error) {
    showState("Error en búsqueda");
  }
}

async function createPost() {
  const author = profileNameInput.value.trim();
  const body = postInput.value.trim();

  if (author === "") {
    createFeedback.textContent = "Debes ingresar un nombre de usuario antes de publicar.";
    profileNameInput.focus();
    return;
  }

  if (body === "") {
    createFeedback.textContent = "Escribe un mensaje antes de publicar.";
    postInput.focus();
    return;
  }

  createFeedback.textContent = "Publicando...";

  try {
    const response = await fetch(`${API}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "post",
        body: body,
        userId: 1
      })
    });

    if (!response.ok) {
      throw new Error("Error al publicar");
    }

    const data = await response.json();

    localPosts.unshift({
      id: data.id || Date.now(),
      author: author,
      body: body
    });

    postInput.value = "";
    createFeedback.textContent = "Post publicado";

    if (searchActive && searchInput.value.trim() !== "") {
      await searchPosts();
    } else {
      await loadPosts();
    }
  } catch (error) {
    createFeedback.textContent = "Error publicando";
  }
}

searchBtn.addEventListener("click", searchPosts);

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  loadPosts();
});

publishBtn.addEventListener("click", createPost);

profileNameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    postInput.focus();
  }
});

postInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && event.ctrlKey) {
    createPost();
  }
});

loadPosts();