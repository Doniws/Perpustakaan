const books = [];

const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF_APP";

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookshelf = document.querySelector(".bookshelf-1-not-yet");
    uncompletedBookshelf.innerHTML = "";

    const completedBookshelf = document.querySelector(
        ".bookshelf-2-already-read"
    );
    completedBookshelf.innerHTML = "";

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompletedBookshelf.append(bookElement);
        } else {
            completedBookshelf.append(bookElement);
        }
    }

});

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert("Browser tidak mendukung local storage");
        return false;
    }
    return true;
}

function saveDataToLocalStorage() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function loadDataFromLocalStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author , year, isComplete) {
    const yearAsNumber = Number(year);
    return {
        id,
        title,
        author,
        year : yearAsNumber,
        isComplete,
    };
}

function addBook(title, author, year, isComplete) {
    const generatedID = generateId();

    const bookObject = generateBookObject(
        generatedID,
        title,
        author,
        year,
        isComplete
    );

    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector(".search-input");

function searchBooks(searchBook) {
    const searchResult = books.filter((book) => {
        return book.title.toLowerCase().includes(searchBook.toLowerCase());
    });
    const uncompletedBookshelf = document.querySelector(".bookshelf-1-not-yet");
    uncompletedBookshelf.innerHTML = "";
    const completedBookshelf = document.querySelector(
        ".bookshelf-2-already-read"
    );
    completedBookshelf.innerHTML = "";
    for (const bookItem of searchResult) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompletedBookshelf.append(bookElement);
        } else {
            completedBookshelf.append(bookElement);
        }
    }
}

searchButton.addEventListener("click", () => {
    searchBooks(searchInput.value);
    searchInput.value = "";
});

document.addEventListener("DOMContentLoaded", () => {
    const submitForm = document.querySelector(".add-form");

    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const titleInput = document.querySelector("#title").value;
        const authorInput = document.querySelector("#author").value;
        const yearInput = document.querySelector("#year").value;
        const isCompleteCheckbox = document.querySelector(".checkbox");
        const isComplete = isCompleteCheckbox.checked;

        addBook(titleInput, authorInput, yearInput, isComplete);

        document.querySelector("#title").value = "";
        document.querySelector("#author").value = "";
        document.querySelector("#year").value = "";
        document.querySelector(".checkbox").checked = false;
    });

    loadDataFromLocalStorage();
});

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveDataToLocalStorage();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function makeBook(bookObject) {
    const textContainer = document.createElement("div");
    textContainer.classList.add("text-container");

    textContainer.innerHTML = `
    <div>
        <span>Judul : <p>${bookObject.title}</p></span>
        <span> Penulis : <p>${bookObject.author}</p></span>
        <span> Tahun : <p>${bookObject.year}</p></span>
    </div>
    `;

    const bookContainer = document.createElement("div");
    bookContainer.classList.add("book-container");
    bookContainer.append(textContainer);
    bookContainer.setAttribute("id", bookObject.id);
    bookContainer.setAttribute("data-isComplete", bookObject.isComplete);

    
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.innerHTML = "Edit";

    editButton.addEventListener("click", function () {
        showEditForm(bookObject);
    });

    bookContainer.append(editButton);

    if (bookObject.isComplete) {
        const undoButton = document.createElement("button");
        undoButton.classList.add("undo-button");
        undoButton.innerHTML = "Belum selesai dibaca";

        undoButton.addEventListener("click", function () {
            undoTaskFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        trashButton.innerHTML = "Hapus buku";

        trashButton.addEventListener("click", function () {
            confirmDeleteBook(bookObject.id);
        });

        bookContainer.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement("button");
        checkButton.classList.add("check-button");
        checkButton.innerHTML = "Selesai dibaca";

        checkButton.addEventListener("click", function () {
            addTaskToCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        trashButton.innerHTML = "Hapus buku";

        trashButton.addEventListener("click", function () {
            removeTaskFromCompleted(bookObject.id);
        });

        bookContainer.append(checkButton, trashButton);
    }   

  
    return bookContainer;
}

function showEditForm(bookObject) {
    const editTitleInput = document.querySelector("#editTitle");
    const editAuthorInput = document.querySelector("#editAuthor");
    const editYearInput = document.querySelector("#editYear");
    const editIsCompleteCheckbox = document.querySelector("#editIsComplete");

    editTitleInput.value = bookObject.title;
    editAuthorInput.value = bookObject.author;
    editYearInput.value = bookObject.year;
    editIsCompleteCheckbox.checked = bookObject.isComplete;

    document.querySelector(".edit-form-container").style.display = "block";

    const updateButton = document.querySelector(".update-button");
    updateButton.addEventListener("click", function () {
        updateBook(bookObject.id);
    });

    const cancelButton = document.querySelector(".cancel-button");
    cancelButton.addEventListener("click", function () {
        document.querySelector(".edit-form-container").style.display = "none";
    });
}

function updateBook(bookId) {
    const editTitleInput = document.querySelector("#editTitle").value;
    const editAuthorInput = document.querySelector("#editAuthor").value;
    const editYearInput = document.querySelector("#editYear").value;
    const editIsCompleteCheckbox = document.querySelector("#editIsComplete").checked;

    const bookIndex = findBookIndex(bookId);

    if (bookIndex !== -1) {
        books[bookIndex].title = editTitleInput;
        books[bookIndex].author = editAuthorInput;
        books[bookIndex].year = editYearInput;
        books[bookIndex].isComplete = editIsCompleteCheckbox;

        document.dispatchEvent(new Event(RENDER_EVENT));

        document.querySelector(".edit-form-container").style.display = "none";

        saveDataToLocalStorage();
    }
}

function confirmDeleteBook(bookId) {
    const confirmation = confirm("Apakah Anda yakin ingin menghapus buku ini?");

    if (confirmation) {
        removeTaskFromCompleted(bookId);
    }
}