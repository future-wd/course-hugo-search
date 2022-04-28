import Fuse from 'fuse.js/dist/fuse.basic.esm.js'

const searchInput = document.getElementById('js-searchInput');
const searchResults = document.getElementById('js-searchResults');


// ***********************
// search index (JSON)
//
// create search index with hugo scratch
{{- $scratch := newScratch -}}
{{- $scratch.Set "index" slice -}}
{{- $pages := .Site.RegularPages -}}
{{- $pages = where $pages "Params.private" "!=" "true" -}}
{{- range $pages -}}
  {{- $scratch.Add "index" (dict "title" .Title "summary" .Summary "content" .Plain "companies" .Params.companies "species" .Params.species "permalink" .Permalink) -}}
{{- end -}}
// write json data to file
const searchIndex = {{ $scratch.Get "index" | jsonify }};
console.log(`JSON DATA: ${JSON.stringify(searchIndex)}`);

// ***********************
// search params function
//
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



