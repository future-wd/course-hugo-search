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
//
const searchQuery = params('q');
if (searchQuery) {
  // add the query to search input
  searchInput.value = searchQuery;
  searchResults.innerHTML = 'Loading...';
  // run the search
  search(searchIndex, searchQuery);
} else { // no search query
  searchResults.innerHTML = 'Please input your search into the search box above.';
}


// ***********************
// run search
//
function search(data, pattern) {
  const options = {
    // // isCaseSensitive: false,
    // // includeScore: false,
    // // shouldSort: true,
    // // includeMatches: false,
    // findAllMatches: true,
    // minMatchCharLength: 2,
    // // location: 0,
    // threshold: 0.4,
    // // distance: 100,
    // // useExtendedSearch: false,
    // ignoreLocation: true,
    // // ignoreFieldNorm: false,
    // // fieldNormWeight: 1,
    keys: [
      "title", // default weight 1
      {name: "summary", weight: 0.8},
      { name: "content", weight: 0.6 },
      { name: "companies", weight: 0.4},
      { name: "species", weight: 0.4},
     ]
  };
  // new fuse instance
  const fuse = new Fuse(data, options);
  // JSON search results
  const JSONresults = fuse.search(pattern);
  // convert JSON to object
  const results = JSON.stringify(JSONresults);
  const resultsO = JSON.parse(JSONresults);
  console.log(JSONresults)
  // call resuljts function
   showResults(results);
}

function showResults(results) {
  if (!results.length) { // no results
    searchResults.innerHTML = 'No results found.';
  } else { //results found
    searchResults.innerHTML = ''
    results.forEach((value, key) => {
      const output = value;
      searchResults.innerHTML += output;
    })
  }

}
