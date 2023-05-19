/*  PWA Service worker register */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}
// wait for the DOM
document.addEventListener("DOMContentLoaded", checkLocalStorage)
// current list, syncs with localStorage
let myAnimeList = [
    /*{
        "name": "Naruto",
        "episodes": 12,
        "watched": 3,
        "image": "https://m.media-amazon.com/images/M/MV5BMDI3ZDY4MDgtN2U2OS00Y2YzLWJmZmYtZWMzOTM3YWFjYmUyXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        "lastWatched": "",
        "id": "2049833453"
    },
    {
        "name": "Shingeki no Kiyojin",
        "episodes": 34,
        "watched": 3,
        "image": "https://m.media-amazon.com/images/M/MV5BMGY3Mzg3M2UtNzYxNi00ZDYzLTlhMTQtMjkzZTA2MWQ4NjA0XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg",
        "lastWatched": "",
        "id": "54564564"
    },
    {
        "name": "Jujutsu Kaisen",
        "episodes": 46,
        "watched": 3,
        "image": "https://m.media-amazon.com/images/M/MV5BMTMwMDM4N2EtOTJiYy00OTQ0LThlZDYtYWUwOWFlY2IxZGVjXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        "lastWatched": "",
        "id": "156345244"
    },
    {
        "name": "Kimetsu no Yaiba",
        "episodes": 66,
        "watched": 3,
        "image": "https://m.media-amazon.com/images/M/MV5BNmFhY2I1ZjMtMzBkNy00MjZiLWI3Y2ItMDhhYmJmMzc4MGZiXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_FMjpg_UX1000_.jpg",
        "lastWatched": "",
        "id": "098342093"
    }*/
]
let userSettings = [{
    colorScheme: "dark",
    filterType: ""
}]
// set 
const list = document.getElementById("list")
// checks if any local data and syncs with array
// checkLocalStorage();

async function getList() {
    if (myAnimeList.length == 0) {
        let emptyPageTemplate = `
        <p>Add here some anime</p>
        <button class="btn btn-primary rounded-circle ui-btn--add" data-bs-toggle="modal"
                data-bs-target="#addAnimeModal">
                <i class="fa-solid fa-plus"></i>
            </button>
        `
        list.insertAdjacentHTML("beforeend", emptyPageTemplate)
    }
    // delayed loop script
    //const delay = ms => new Promise(res => setTimeout(res, ms)) // delay
    for (let anime of myAnimeList) {
        let status = {};
        if (anime.episodes == anime.watched) {
            status.text = "Completed"
            status.class = "text-success fw-bold"
        } else {
            status.text = "Watched"
            status.class = "text-secondary"
        }
        // anime card
        let li = `
                <div class="p-1 list-items " id="${anime.id}">
                    <div class="rounded-3 d-flex flex-sm-column shadow overflow-hidden
                    border border-2 m-1 p-0">
                        <div class="col-4 col-sm-12">
                            <img src="${anime.image}"
                                class="card-img-bottom" alt="..." style="aspect-ratio:2/3">
                        </div>
                        <div class="col-8 col-sm-12 d-flex flex-column justify-content-between">
                            <div class="p-2 text-center">
                                <div class="anime-name fs-5 fw-bold ">${anime.name}</div>
                            </div>
                            <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="${status.class} small"><i class="fa-solid fa-eye"></i> ${status.text}</div>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <button type="button" onclick="countDown(${anime.id})" class="btn btn-sm">-</button>
                                            <span class="px-2 fw-bold fs-2">${anime.watched}</span>
                                            <button type="button" onclick="countUp(${anime.id})" class="btn btn-sm">+</button>
                                        </div>
                                    </div>
                                </li>
                                <li class="list-group-item">
                                    <div class="d-flex justify-content-between">
                                        <div class="small"><i class="fa-solid fa-film"></i> Episodes</div>
                                        <div>${anime.episodes}</div>
                                    </div>
                                </li>
                                <li class="list-group-item">
                                    <div class="d-flex flex-column text-secondary small">
                                        <div><i class="fa-regular fa-calendar-check"></i> Last Watched</div>
                                        <div>${anime.lastWatched}</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>`
        list.insertAdjacentHTML("beforeend", li)
        //await delay(100)
    }
    updateLocalStorage();
}
// localStorage controls
function checkLocalStorage() {
    localData = localStorage.getItem("myAnimeList")
    if (localData) {
        myAnimeList = JSON.parse(localData)
    }
    getList();
}
function updateLocalStorage() {
    localStorage.setItem("myAnimeList", JSON.stringify(myAnimeList))
}

// Watched episodes count functions
function countUp(id) {
    list.innerHTML = ""
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    if (myAnimeList[itemIndex].watched < myAnimeList[itemIndex].episodes) {
        myAnimeList[itemIndex].watched++
        myAnimeList[itemIndex].lastWatched = new Date().toLocaleString()
    }
    getList()
}
function countDown(id) {
    list.innerHTML = ""
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    if (myAnimeList[itemIndex].watched > 0) {
        myAnimeList[itemIndex].watched--
        myAnimeList[itemIndex].lastWatched = new Date().toLocaleString()
    }
    getList()
}

// Add new Anime
class NewAnime {
    constructor(name, episode, img) {
        this.name = name
        this.episode = episode
        this.img = img
        this.date = new Date().toLocaleString()
        this.watched = 0
        this.id = Math.floor(Math.random() * 999999999)
    }
}
function addNewAnime(name, episode, img) {
    let payload = new NewAnime(name, episode, img)
    pushList(payload)
}
function pushList(payload) {
    let animeListItem = {
        "name": payload.name,
        "episodes": payload.episode,
        "watched": payload.watched,
        "image": payload.img,
        "lastWatched": payload.date,
        "id": payload.id
    }
    myAnimeList.push(animeListItem)
    list.innerHTML = ""
    getList()
}

// Search Anime from kitsu API
let searchResults = []
const resultList = document.querySelector("#resultList")
// Fecth anime data
async function fetchAnimeData() {
    resultList.innerHTML = ""
    const searchText = document.querySelector("#searchText").value
    const response = await fetch("https://kitsu.io/api/edge/anime?filter[text]=" + searchText);
    const jsonData = await response.json();
    // set search result to array
    searchResults = jsonData.data
    if (searchResults.length > 0) {
        // loop for results
        for (let result of searchResults) {
            let li = `
            <li class="list-group-item p-0 d-flex position-relative">
                <img class="col-2" src="${result.attributes.posterImage.small}"/>
                <div class="p-3 col-10 d-flex flex-column ">
                    <div class="fw-bold">${result.attributes.titles.en_jp}</div>
                    <div class="small">${result.attributes.canonicalTitle}</div>
                    <span class="small">Episodes: ${result.attributes.episodeCount}</span>
                    <button class="rounded-circle position-absolute btn btn-sm btn-info end-0 bottom-0 m-2"
                    onclick="addNewAnime('${result.attributes.titles.en_jp}', ${result.attributes.episodeCount}, '${result.attributes.posterImage.medium}')">
                    <i class="fa-solid fa-plus"></i>
                </button>
                </div>
            </li>
            `
            resultList.insertAdjacentHTML("beforeend", li)
        }
    } else {
        resultList.innerHTML = "Nothing found"
    }
}

// Dark mode conrolls
let checkbox = document.querySelector("input[name=darkModeToggle]")
let mainHTML = document.querySelector("html")
let metaTheme = document.querySelector("meta[name=theme-color]")
checkbox.addEventListener('change', function () {
    if (this.checked) {
        mainHTML.setAttribute("data-bs-theme", "dark")
        metaTheme.setAttribute("content", "#000")
    } else {
        mainHTML.setAttribute("data-bs-theme", "light")
        metaTheme.setAttribute("content", "#fff")
    }
});





/* TODO
    -   Remove anime button
    -   Sort by filters
    -   Add filter and color settings to localStorage and check before page load
    -   Dont refresh whole list while count up or down
        (set innerHTML and update localStorage)
    -   Add about section
    -   Internet connection check
    -   APP ICON
    -   

*/