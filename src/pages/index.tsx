import { Layout } from "@/components/Layout";


export default function Home() {
  return (
    <Layout>
      <section className="main-content">
        <h1>Dashboard</h1>

        <div className="main-content__links-container">
          <a href="/catalog">Catalog</a>
          <a href="/drafts">Drafts</a>
          <a href="/listings">Listings</a>
          <a href="/system">System</a>
        </div>
      </section>
    </Layout>
  );
}
