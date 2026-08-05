assets/images/
===============

logo-punarjiva.jpg
  The real logo, downloaded from https://www.punarjiva.in/logo-punarjiva.jpg.
  A crisper SVG version of the leaf emblem lives at
  assets/svg/logos/logoPunarjivaMark.svg and is what the header and favicon use.

REAL PHOTOGRAPHY GOES HERE
--------------------------
The site currently displays the same three Unsplash stock photos that
www.punarjiva.in already uses. They are placeholders and look like a generic
organic store, not YOUR store in Proddatur.

To swap in real photographs:

  1. Drop the files in this folder, e.g. storeFront.jpg, shelvesMillets.jpg
  2. Open the relevant JSON file in ../../data/ and change the "image" value to
     a project-relative path, e.g. "assets/images/storeFront.jpg"
  3. Update the matching "alt" text to describe what the new photo actually
     shows — it is read aloud by screen readers and counts for SEO.

That is the whole process. No HTML, CSS or JavaScript needs to change.

Which files reference images:
  data/home.json      heroImage
  data/gallery.json   images[].image        <- the main one to replace
  data/products.json  categories[].image
  data/about.json     storeImage
  data/visit.json     storeImage
  data/blog.json      posts[].heroImage

Once data/gallery.json holds real photos, also remove its
"placeholderImagery": true flag so the "stock photography" notice disappears.
