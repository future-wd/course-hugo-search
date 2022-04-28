import Fuse from 'fuse.js/dist/fuse.basic.esm.js'

const searchInput = document.getElementById('js-searchInput');
const searchResults = document.getElementById('js-searchResults');

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
  search(searchIndex);
} else { // no search query
  searchResults.innerHTML = 'Please input your search into the search box above.';
}


// ***********************
// run search
//
function search(data) {
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
    // keys: [
    //   "title", // default weight 1
    //   {name: "summary", weight: 0.8},
    //   { name: "content", weight: 0.6 },
    //   { name: "companies", weight: 0.4},
    //   { name: "species", weight: 0.4},
    // ]
  };
  // create new fuse instance
  const fuse = new Fuse(data, options);
  // return results
  const results = fuse.search(searchQuery)

  console.log(results);
}
