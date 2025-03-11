const addNewCollectionButton = document.getElementById("addNewCollection");
const addNewCollectionModal = document.getElementById("addNewCollectionModal");
const addNewCollectionSubmitButton = document.getElementById(
  "submitAddCollection",
);
const collectionList = document.querySelector("header");
const newCollectionNameInputField = document.getElementById(
  "newCollectionName",
);
const collections = document.getElementById("collections");

// Initialize state from localStorage
const state = JSON.parse(localStorage.getItem("state")) || {};

// Save state to localStorage
function saveState() {
  localStorage.setItem("state", JSON.stringify(state));
}

// Update state when collection is added
function addCollectionToState(collectionName) {
  if (!state[collectionName]) {
    state[collectionName] = {};
    saveState();
  }
}

// Update state when collection is removed
function removeCollectionFromState(collectionName) {
  if (state[collectionName]) {
    delete state[collectionName];
    saveState();
  }
}

// Update state when note is added/modified
function updateNoteInState(collectionName, noteId, noteContent) {
  if (!state[collectionName]) {
    state[collectionName] = {};
  }
  state[collectionName][noteId] = noteContent;
  saveState();
}

// Remove note from state
function removeNoteFromState(collectionName, noteId) {
  if (state[collectionName] && state[collectionName][noteId]) {
    delete state[collectionName][noteId];
    saveState();
  }
}

// Create a new collection
function createCollection(collectionName) {
  // Create collection link in header
  const newCollectionLink = document.createElement("a");
  newCollectionLink.textContent = collectionName;
  newCollectionLink.href = `#${collectionName}`;
  const lastChild = collectionList.lastElementChild;
  collectionList.insertBefore(newCollectionLink, lastChild);

  // Create collection container
  const newCollection = document.createElement("div");
  newCollection.classList.add("collection");
  newCollection.id = `${collectionName}`;

  // Create delete button
  const deleteCollectionButton = document.createElement("button");
  deleteCollectionButton.innerText = "Delete collection";
  deleteCollectionButton.classList.add("deleteCollection");
  deleteCollectionButton.onclick = () => {
    newCollection.remove();
    newCollectionLink.remove();
    removeCollectionFromState(collectionName);
  };
  newCollection.appendChild(deleteCollectionButton);

  // Create add note button
  const addNewNote = document.createElement("button");
  addNewNote.classList.add("addNote");
  addNewNote.innerText = "Add note";
  addNewNote.onclick = () => {
    createNote(newCollection, collectionName);
  };
  newCollection.appendChild(addNewNote);

  collections.appendChild(newCollection);

  // Add to state
  addCollectionToState(collectionName);

  return newCollection;
}

// Create a new note
function createNote(
  collectionElement,
  collectionName,
  noteId = null,
  content = "",
) {
  const noteContainer = document.createElement("div");
  noteContainer.classList.add("note");

  // Generate a unique ID for this note if not provided
  if (!noteId) {
    noteId = `note_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
  noteContainer.id = noteId;

  // Create textarea for note content
  const noteContent = document.createElement("textarea");
  noteContent.value = content;
  noteContent.readOnly = true;
  noteContent.addEventListener("click", () => {
    noteContent.readOnly = false;
    noteContent.parentElement.style.width = "80vw";
    noteContent.parentElement.style.minHeight = "80vh";

    // Create delete note button
    const deleteNoteButton = document.createElement("button");
    deleteNoteButton.innerText = "Delete";
    deleteNoteButton.classList.add("deleteNote");
    deleteNoteButton.onclick = () => {
      noteContainer.remove();
      removeNoteFromState(collectionName, noteId);
    };

    // Create save note button
    const saveNoteButton = document.createElement("button");
    saveNoteButton.innerText = "Save";
    saveNoteButton.classList.add("saveNote");
    saveNoteButton.onclick = () => {
      updateNoteInState(collectionName, noteId, noteContent.value);
      noteContent.parentElement.style.width = "";
      noteContent.parentElement.style.minHeight = "";
      deleteNoteButton.remove();
      saveNoteButton.remove();
    };
    noteContainer.appendChild(deleteNoteButton);
    noteContainer.appendChild(saveNoteButton);
  });

  noteContainer.appendChild(noteContent);
  collectionElement.appendChild(noteContainer);

  // Update state with the new/existing note
  updateNoteInState(collectionName, noteId, content);

  return noteContainer;
}

// Handle adding new collection
addNewCollectionButton.addEventListener("click", () => {
  addNewCollectionModal.style.visibility =
    addNewCollectionModal.style.visibility === "visible" ? "hidden" : "visible";
});

// Handle submitting new collection
addNewCollectionSubmitButton.addEventListener("click", () => {
  const newCollectionName = newCollectionNameInputField.value;
  if (newCollectionName.trim() !== "") {
    createCollection(newCollectionName);
    newCollectionNameInputField.value = "";
    addNewCollectionModal.style.visibility = "hidden";
  }
});

// Load stored collections and notes on page load
document.addEventListener("DOMContentLoaded", () => {
  // For each collection in state
  Object.keys(state).forEach((collectionName) => {
    const collectionElement = createCollection(collectionName);

    // For each note in collection
    Object.keys(state[collectionName]).forEach((noteId) => {
      const noteContent = state[collectionName][noteId];
      createNote(collectionElement, collectionName, noteId, noteContent);
    });
  });

  document.querySelectorAll("a").forEach((anchor) => {
    anchor.addEventListener("click", function () {
      document.querySelectorAll("a").forEach((a) =>
        a.classList.remove("active-link")
      ); // Remove underline from all
      this.classList.add("active-link"); // Add underline to clicked one
    });
  });
});
