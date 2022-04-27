import Fuse from 'fuse.js/dist/fuse.basic.esm.js'

const searchInput = document.getElementById('js-searchInput');
const searchResults = document.getElementById('js-searchResults');


// ***********************
// search params function

function params(name) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(name)
}

// ***********************
// check to see if a search has taken place
const searchQuery = params('q');
if (searchQuery) {
  // add the query to search input
  searchInput.value = searchQuery;
  searchResults.innerHTML = 'Loading...';
  // run the search
} else { // no search query
  searchResults.innerHTML = 'Please input your search into the search box above.';
}

const searchIndex = `
  {{ $index := newScratch }}
  {{ $pages := .Site.RegularPages }}
  {{ $pages = where $pages "Params.private" "!=" "true" }}
  {{ $index.Set "index" slice }}
  {{ range $pages }}
    {{ $index.Add "index" (dict "title" .Title "permalink" .Permalink "images" .Params.images "content" .Plain "summary" .Summary "companies" .Params.companies "species" .Params.species )}}
  {{ end }}
  {{ $index.Get "index" | jsonify }}
 `
console.log(JSON.stringify(searchIndex));
