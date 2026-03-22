import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="selection:bg-primary/20 min-h-screen">
      {/* HEADER */}
      <header className="bg-surface/80 fixed top-0 z-50 w-full backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <span className="font-display text-primary text-2xl font-bold tracking-tighter">
              HYUNDAI
              <span className="text-on-surface ml-2 align-middle text-sm font-light tracking-widest opacity-60">
                Nhật Năng
              </span>
            </span>
            <nav className="hidden gap-8 md:flex">
              {["Products", "Solutions", "Services"].map((item) => (
                <Link
                  key={item}
                  className="font-display text-outline hover:text-primary text-sm tracking-wider uppercase transition-colors"
                  href="/"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <button className="font-display text-on-surface hover:text-primary hidden text-xs font-bold tracking-widest uppercase transition-colors md:flex">
              Support 24/7
            </button>
            <button className="bg-primary hover:bg-on-surface text-on-primary font-display shadow-primary/20 transform rounded-full px-6 py-3 text-xs tracking-widest uppercase shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              Request Quote
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-surface-container-low relative flex min-h-[90vh] items-center overflow-hidden pt-32 pb-20">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="max-w-xl">
            <div className="bg-surface-container-high mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1">
              <span className="bg-primary h-2 w-2 animate-pulse rounded-full"></span>
              <span className="font-display text-on-surface text-[10px] font-semibold tracking-widest uppercase">
                Heavy Duty Series
              </span>
            </div>
            <h1 className="font-display text-on-surface mb-6 text-6xl leading-[1.1] font-bold tracking-tighter md:text-7xl">
              Uninterruptible <br />
              <span className="text-primary italic">Power.</span>
            </h1>
            <p className="text-outline mb-10 max-w-md font-sans text-lg leading-relaxed">
              Ensure business continuity with Hyundai&apos;s industrial-grade
              generators. Engineered for absolute reliability under extreme
              conditions.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="bg-on-surface text-on-primary font-display hover:bg-primary flex items-center justify-center gap-2 rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors">
                Explore Generators
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
              <button className="font-display text-on-surface hover:bg-surface-container-high flex items-center justify-center rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors">
                Consultation
              </button>
            </div>
          </div>
          {/* Hero Image */}
          <div className="relative h-90 w-full md:-mr-[15%] md:h-130 md:w-[115%]">
            <Image
              src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=2832&auto=format&fit=crop"
              alt="Hyundai Industrial Generator Setup"
              width={2832}
              height={1888}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 55vw"
              className="h-full w-full rounded-l-3xl object-cover object-center shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface pt-24 pb-12">
        <div className="mx-auto mb-20 grid max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <span className="font-display text-primary mb-6 block text-2xl font-bold tracking-tighter">
              HYUNDAI{" "}
              <span className="text-on-surface font-light opacity-60">
                NHAT NANG
              </span>
            </span>
            <p className="text-outline mb-8 max-w-sm font-sans text-sm">
              Empowering industries through reliable energy solutions, superior
              engineering, and dedicated 24/7 technical support.
            </p>
            {/* GHOST INPUT COMPONENT */}
            <div className="flex max-w-md items-end gap-4">
              <div className="flex-1">
                <label className="font-display text-primary mb-2 block text-[10px] font-bold tracking-widest uppercase">
                  Technical Updates
                </label>
                <input
                  type="email"
                  placeholder="Enter business email"
                  className="ghost-input text-on-surface w-full py-2 font-sans"
                />
              </div>
              <button className="font-display text-on-surface hover:text-primary pb-2 text-xs font-bold tracking-widest uppercase transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          <div>
            <h5 className="font-display text-primary mb-6 text-xs font-bold tracking-widest uppercase">
              Products
            </h5>
            <ul className="space-y-4">
              {[
                "Industrial Generators",
                "Residential Gen",
                "Portable Power",
                "ATS Panels",
              ].map((item) => (
                <li key={item}>
                  <Link
                    className="text-outline hover:text-primary font-sans text-sm transition-colors"
                    href="/"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
