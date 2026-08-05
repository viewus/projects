/* ---------------------------------------------------------------------------
 * blogRenderer.js — the listing grid, the ?category= filter, and the body of
 * an individual post. Post pages are real HTML files; this only supplies the
 * article body so the prose lives in data/blog.json with everything else.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  /** Project-relative URL for a post page. */
  function postHref(slug) {
    return pjPath("pages/blog/" + slug + ".html");
  }

  /** Read ?category= off the current URL; "" means show everything. */
  function currentCategory() {
    return new URLSearchParams(window.location.search).get("category") || "";
  }

  function sortByDateDesc(posts) {
    return posts.slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
  }

  /** Render the listing grid, filtered to `category` when one is given. */
  function renderPostGrid(blog, category) {
    var posts = sortByDateDesc(blog.posts);
    if (category) {
      posts = posts.filter(function (p) { return p.category === category; });
    }

    if (!posts.length) {
      return Promise.resolve('<p class="blogEmpty">' + pjEscape(blog.emptyMessage) + "</p>");
    }

    return renderCardGrid(posts.map(function (post) {
      return Object.assign({}, post, { variant: "blog", href: postHref(post.slug) });
    }));
  }

  /** Category filter chips; the active one is marked for styling + a11y. */
  function renderCategoryFilter(blog, category) {
    var all = [{ slug: "", label: blog.allLabel }].concat(blog.categories);

    return all.map(function (cat) {
      var isActive = cat.slug === category;
      var href = cat.slug
        ? pjPath("pages/blog.html?category=" + encodeURIComponent(cat.slug))
        : pjPath("pages/blog.html");

      return '<a class="blogFilterChip' + (isActive ? " isActive" : "") + '" href="' +
        pjEscape(href) + '"' + (isActive ? ' aria-current="true"' : "") + ">" +
        pjEscape(cat.label) + "</a>";
    }).join("");
  }

  /** Turn a post's body blocks into article markup. */
  function renderPostBody(blocks) {
    return (blocks || []).map(function (block) {
      switch (block.type) {
        case "h2":
          return '<h2 class="postHeading">' + pjEscape(block.text) + "</h2>";
        case "quote":
          return '<blockquote class="postQuote">' + pjEscape(block.text) + "</blockquote>";
        case "ul":
          return '<ul class="postList">' + (block.items || []).map(function (item) {
            return '<li class="postListItem">' + pjEscape(item) + "</li>";
          }).join("") + "</ul>";
        default:
          return '<p class="postParagraph">' + pjEscape(block.text) + "</p>";
      }
    }).join("");
  }

  function findPost(blog, slug) {
    return (blog.posts || []).filter(function (p) { return p.slug === slug; })[0];
  }

  /** "Keep reading" cards at the foot of a post. */
  function renderRelated(blog, post) {
    var related = (post.related || []).map(function (slug) {
      return findPost(blog, slug);
    }).filter(Boolean);

    if (!related.length) return Promise.resolve("");

    return renderCardGrid(related.map(function (p) {
      return Object.assign({}, p, { variant: "blog", href: postHref(p.slug) });
    }));
  }

  window.postHref = postHref;
  window.currentCategory = currentCategory;
  window.renderPostGrid = renderPostGrid;
  window.renderCategoryFilter = renderCategoryFilter;
  window.renderPostBody = renderPostBody;
  window.renderRelated = renderRelated;
  window.findPost = findPost;

})(window);
