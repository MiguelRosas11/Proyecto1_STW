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

const POST_PREVIEW_LIMIT = 160;

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

function normalizeApiPost(post, usersMap) {
  const user = usersMap[post.userId];

  return {
    id: post.id,
    title: post.title,
    author: user
      ? `${user.firstName} ${user.lastName}`
      : `Usuario ${post.userId}`,
    username: user ? `@${user.username}` : `@user${post.userId}`,
    avatar: user ? user.image : "",
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

    const header = document.createElement("div");
    header.className = "post-header";

    const avatar = document.createElement("img");
    avatar.className = "post-avatar";
    avatar.src = post.avatar || "https://dummyjson.com/icon/user/80";
    avatar.alt = `Foto de ${post.author}`;

    const authorBox = document.createElement("div");
    authorBox.className = "post-author-box";

    const author = document.createElement("div");
    author.className = "post-author";
    author.textContent = post.author;

    const username = document.createElement("div");
    username.className = "post-username";
    username.textContent = post.username || "";

    const message = document.createElement("div");
    message.className = "post-body";
    message.textContent = post.body;

    const fullBody = post.body || "";
    const shouldTruncate = fullBody.length > POST_PREVIEW_LIMIT;
    const previewText = shouldTruncate
      ? fullBody.slice(0, POST_PREVIEW_LIMIT).trim() + "..."
      : fullBody;

    message.textContent = previewText;

    authorBox.appendChild(author);
    authorBox.appendChild(username);

    header.appendChild(avatar);
    header.appendChild(authorBox);

    card.appendChild(header);
    card.appendChild(message);

    if (shouldTruncate) {
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "post-toggle-btn";
      toggleBtn.textContent = "Ver más";

      let expanded = false;

      toggleBtn.addEventListener("click", () => {
        expanded = !expanded;

        message.textContent = expanded ? fullBody : previewText;
        toggleBtn.textContent = expanded ? "Ver menos" : "Ver más";
      });

      card.appendChild(toggleBtn);
    }

    postsContainer.appendChild(card);
  });
}

async function loadPosts() {
  searchActive = false;
  showState("Cargando posts...");

  try {
    const [postsResponse, usersResponse] = await Promise.all([
      fetch(API),
      fetch("https://dummyjson.com/users?limit=0")
    ]);

    if (!postsResponse.ok || !usersResponse.ok) {
      throw new Error("Error al cargar datos");
    }

    const postsData = await postsResponse.json();
    const usersData = await usersResponse.json();

    const usersMap = {};
    usersData.users.forEach(user => {
      usersMap[user.id] = user;
    });

    const apiPosts = postsData.posts.map(post => normalizeApiPost(post, usersMap));

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
    const usersResponse = await fetch("https://dummyjson.com/users?limit=0");

    if (!usersResponse.ok) {
      throw new Error("Error cargando usuarios");
    }

    const usersData = await usersResponse.json();
    const usersMap = {};
    usersData.users.forEach(user => {
      usersMap[user.id] = user;
    });

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

      const apiMatch = normalizeApiPost(post, usersMap);

      renderPosts([...localMatches, apiMatch]);
      return;
    }

    const res = await fetch(`${API}/search?q=${encodeURIComponent(value)}`);

    if (!res.ok) {
      throw new Error("Error en búsqueda");
    }

    const data = await res.json();
    const apiResults = data.posts.map(post => normalizeApiPost(post, usersMap));

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