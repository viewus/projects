import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Skeleton } from '../components/ui.jsx';
import { useFeature } from '../hooks/index.jsx';

/** Pages are code-split: each one loads on demand. */
const Home = lazy(() => import('../pages/Home.jsx'));
const Categories = lazy(() => import('../pages/Categories.jsx'));
const Category = lazy(() => import('../pages/Category.jsx'));
const Providers = lazy(() => import('../pages/Providers.jsx'));
const Provider = lazy(() => import('../pages/Provider.jsx'));
const Content = lazy(() => import('../pages/Content.jsx'));
const Listing = lazy(() => import('../pages/Listing.jsx'));
const Tags = lazy(() => import('../pages/Tags.jsx'));
const Tag = lazy(() => import('../pages/Tag.jsx'));
const Search = lazy(() => import('../pages/Search.jsx'));
const Blog = lazy(() => import('../pages/Blog.jsx'));
const BlogPost = lazy(() => import('../pages/BlogPost.jsx'));
const Saved = lazy(() => import('../pages/Saved.jsx'));
const FaqPage = lazy(() => import('../pages/FaqPage.jsx'));
const Glossary = lazy(() => import('../pages/Glossary.jsx'));
const Businesses = lazy(() => import('../pages/Businesses.jsx'));
const Business = lazy(() => import('../pages/Business.jsx'));
const StaticPage = lazy(() => import('../pages/StaticPage.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

/** Renders a page only when its feature is switched on (data/site.json -> features). */
function Feature({ name, children }) {
  return useFeature(name) ? children : <NotFound />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="container"><Skeleton rows={8} /></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/creators" element={<Feature name="providers"><Providers /></Feature>} />
        <Route path="/providers" element={<Feature name="providers"><Providers /></Feature>} />
        <Route path="/provider/:slug" element={<Provider />} />
        <Route path="/content/:slug" element={<Content />} />
        <Route path="/trending" element={<Listing kind="trending" />} />
        <Route path="/popular" element={<Listing kind="popular" />} />
        <Route path="/new" element={<Listing kind="new" />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/tag/:slug" element={<Tag />} />
        <Route path="/search" element={<Search />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/faq" element={<Feature name="faq"><FaqPage /></Feature>} />
        <Route path="/glossary" element={<Feature name="glossary"><Glossary /></Feature>} />
        <Route path="/saved" element={<Feature name="saved"><Saved /></Feature>} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/businesses" element={<Feature name="businesses"><Businesses /></Feature>} />
        <Route path="/business/:slug" element={<Feature name="businesses"><Business /></Feature>} />
        <Route path="/page/:slug" element={<StaticPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
