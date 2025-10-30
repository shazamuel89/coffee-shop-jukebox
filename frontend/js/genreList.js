const genreList = document.getElementById("genreList");

const genres = ["Rock", "Pop", "Hip Hop", "Jazz", "Classical", "Electronic", "Reggae", "Blues", "Country", "Folk", "Metal", "R&B", "Soul", "Punk", "Disco", "House", "Techno", "Ambient", "Ska", "Gospel"];

function displayGenres() {
    for (let i = 0; i < genres.length; i++) {
    	const listItem = document.createElement('li');
	listItem.innerHTML = `<label for="${genres[i]}">${genres[i]}</label><input type="checkbox" id="${genres[i]}" name="${genres[i]}">`;
	genreList.appendChild(listItem);
    }
}

displayGenres();
