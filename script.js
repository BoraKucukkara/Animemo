// wait for the DOM
document.addEventListener("DOMContentLoaded", checkLocalStorage)
// PWA Service worker register
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}
// current list, syncs with localStorage
let myAnimeList = [
    {
        "name": "Naruto",
        "episodes": 12,
        "watched": 3,
        "image": "https://m.media-amazon.com/images/M/MV5BMDI3ZDY4MDgtN2U2OS00Y2YzLWJmZmYtZWMzOTM3YWFjYmUyXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        "url": "#",
        "lastWatched": "Thu May 18 2023 02:24:51 GMT+0300 (GMT+03:00)",
        "id": "2049833453"
    },
    {
        "name": "Shingeki no Kiyojin",
        "episodes": 34,
        "watched": 3,
        "image": "https://m.media-amazon.com/images/M/MV5BMGY3Mzg3M2UtNzYxNi00ZDYzLTlhMTQtMjkzZTA2MWQ4NjA0XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg",
        "url": "#",
        "lastWatched": "Thu May 18 2023 02:24:51 GMT+0300 (GMT+03:00)",
        "id": "54564564"
    },
    {
        "name": "Jujutsu Kaisen",
        "episodes": 46,
        "watched": 3,
        "image": "https://m.media-amazon.com/images/M/MV5BMTMwMDM4N2EtOTJiYy00OTQ0LThlZDYtYWUwOWFlY2IxZGVjXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        "url": "#",
        "lastWatched": "Thu May 18 2023 02:24:51 GMT+0300 (GMT+03:00)",
        "id": "156345244"
    },
    /* {
         "name": "Kimetsu no Yaiba",
         "episodes": 67,
         "watched": 3,
         "image": "https://m.media-amazon.com/images/M/MV5BNmFhY2I1ZjMtMzBkNy00MjZiLWI3Y2ItMDhhYmJmMzc4MGZiXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_FMjpg_UX1000_.jpg",
         "url": "#",
         "lastWatched": "Thu May 18 2023 02:24:51 GMT+0300 (GMT+03:00)",
         "id": "098342093"
     } */
]
// set 
const list = document.getElementById("list")
// checks if any local data and syncs with array
checkLocalStorage();

async function getList() {
    //const delay = ms => new Promise(res => setTimeout(res, ms)) // delay
    for (let anime of myAnimeList) {
        let status = {};
        if (anime.episodes == anime.watched) {
            status.text = "Complated"
            status.class = "text-success fw-bold"
        } else {
            status.text = "Watched"
            status.class = "text-secondary"
        }

        let li = `
                <div class="p-1 list-items" id="${anime.id}">
                    <div class="rounded-3 bg-white shadow overflow-hidden  m-1 p-0">
                        <img src="${anime.image}"
                            class="card-img-top" alt="..." style="aspect-ratio:2/3">
                        <div class="p-2 text-center bg-light">
                            <div class="anime-name fs-5 fw-bold ">${anime.name}</div>
                        </div>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between">
                                    <div class="small">Episodes</div>
                                    <div>${anime.episodes}</div>
                                </div>
                            </li>
                            <li class="list-group-item bg-light">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="${status.class} small">${status.text}</div>
                                    <div class="d-flex justify-content-between align-items-center">
                                    <button type="button" onclick="countDown(${anime.id})" class="btn btn-sm btn-light">-</button>
                                        <span class="px-2 fw-bold fs-5">${anime.watched}</span>
                                        <button type="button" onclick="countUp(${anime.id})" class="btn btn-sm btn-light">+</button>
                                    </div>
                                </div>
                            </li>
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between text-secondary small">
                                    <div>Last Watched</div>
                                    <div>${anime.lastWatched}</div>
                                </div>
                            </li>
                        </ul>
                        <div class="p-2">
                            <a href="${anime.url}" target="_blank" class="card-link btn w-100 btn-outline-secondary">Watch</a>
                        </div>
                    </div>
                </div>`
        list.insertAdjacentHTML("beforeend", li)
        //await delay(100)
    }
    updateLocalStorage();
}

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
        getList()
    } else { getList() }
}

// Add new Anime
class NewAnime {
    constructor(name, episode, url, img) {
        this.name = name
        this.episode = episode
        this.url = url
        this.img = img
        this.date = new Date().toLocaleString()
        this.watched = 0
        this.id = Math.floor(Math.random() * 999999999)
    }
}
function addNewAnime() {
    let name = document.getElementById("animeName").value
    let episode = document.getElementById("episodeNumber").value
    let url = document.getElementById("watchUrl").value
    let img = document.getElementById("coverUrl").value
    let payload = new NewAnime(name, episode, url, img)
    pushList(payload)
}
function pushList(payload) {
    let animeListItem = {
        "name": payload.name,
        "episodes": payload.episode,
        "watched": payload.watched,
        "image": payload.img,
        "url": payload.url,
        "lastWatched": payload.date,
        "id": payload.id
    }
    myAnimeList.push(animeListItem)
    list.innerHTML = ""
    getList()
}
