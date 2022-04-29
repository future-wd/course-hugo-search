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
  {{- $companiesTerms := .GetTerms "companies" -}}
  {{- $companies := slice -}}
  {{- range $companiesTerms -}}
    {{- $companies = $companies | append (dict "title" (.Title | humanize | title ) "relPermalink" .RelPermalink )}}
  {{- end -}}
  {{- $speciesTerms := .GetTerms "species" -}}
  {{- $species := slice -}}
  {{- range $speciesTerms -}}
    {{- $species = $species | append (dict "title" (.Title | humanize | title ) "relPermalink" .RelPermalink )}}
  {{- end -}}
  {{- $scratch.Add "index" (dict "title" .Title "summary" .Summary "content" .Plain "companies" $companies "species" $species "permalink" .Permalink) -}}
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
  // search results (object)
  const results = fuse.search(pattern);
  showResults(results);
}
// ***********************
// show results
//
function showResults(results) {
  if (!results.length) { // no results
    searchResults.innerHTML = 'No results found';
  } else { // results found
    searchResults.innerHTML = ''; // clear DIV
    results.forEach(element => {
      const {title, summary, permalink, content, companies, species} = element.item;
      function taxonomyHTML(taxonomy, titleSingle, titlePlural) {
        let taxonomyHTML = '';
        if (taxonomy.length) { // terms present
          // create an array of term links
          const taxonomyArray = Array.from(taxonomy, value => {
            return `<a href="${value.relPermalink}">${value.title}</a>`;
          })
          // pluralise title
          let taxonomyTitle = titleSingle;
          if (titlePlural && (taxonomyArray.length >= 2)) {
            taxonomyTitle = titlePlural
          }
          // generate HTML
          taxonomyHTML = `
          <div class="pb-1">
            <small>${taxonomyTitle}: ${taxonomyArray.join(', ')}</small>`;
        }
        return taxonomyHTML;
      }
      const output = `
      <div class="pb-3">
        <div class="row">
          <div class="col">
            <h3 class="mb-1"><a href="${permalink}" class="text-decoration-none">${title}</a></h3>
            <div class="mb-1"><a href="${permalink}" class="link-dark">${permalink}</a></div>
            ${taxonomyHTML(companies, 'Company', 'Companies')}
            ${taxonomyHTML(species,'Species')}
            <div class="lh-1">${summary}</div>
          </div>
        </div>
      </div>`;
      searchResults.innerHTML += output;
    });
  }
}

