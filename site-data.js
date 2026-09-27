(() => {
  const STORAGE_KEY = 'store-discovery-community-v1';
  const defaults = {
    heroTitle: "Discover stores. Find what you're looking for.",
    heroSubtitle: 'A private shopping community connecting curious buyers with online stores, products, offers, and brands worth discovering.',
    communityStat: 'A growing circle of curious shoppers',
    tagline: "Discover stores. Discover products. Discover what's next.",
    categories: ['Home & Living', 'Fashion', 'Electronics', 'Office Supplies', 'School Items', 'Gifts', 'Travel', 'Beauty', 'Lifestyle', 'Other'],
    interests: [
      { name: 'Home & Living', detail: 'Comfortable corners, useful objects, and little things that make home feel like yours.', icon: '⌂', color: 'sage' },
      { name: 'Fashion', detail: 'Everyday pieces, independent labels, and a little something unexpected.', icon: '✳', color: 'rose' },
      { name: 'Electronics', detail: 'Clever tools and thoughtful tech that make everyday life easier.', icon: '⌁', color: 'blue' },
      { name: 'Office Supplies', detail: 'Good pens, better notebooks, and desk things that make work feel lighter.', icon: '▤', color: 'yellow' },
      { name: 'School Items', detail: 'Useful finds for the school year, from first-day essentials to study comforts.', icon: '✎', color: 'lilac' },
      { name: 'Gifts', detail: 'Something personal for the people who make your days better.', icon: '♧', color: 'coral' },
      { name: 'Travel', detail: 'Packable favorites and small comforts for wherever you are headed.', icon: '↗', color: 'mint' },
      { name: 'Beauty', detail: 'Daily rituals, good ingredients, and products worth making room for.', icon: '✿', color: 'pink' },
      { name: 'Lifestyle', detail: 'Thoughtful everyday upgrades, from morning to the last page at night.', icon: '☼', color: 'orange' },
      { name: 'Other', detail: 'A little curiosity can lead anywhere. Tell us what is on your list.', icon: '＋', color: 'grey' }
    ],
    stores: [],
    events: [
      { title: 'A first look at thoughtful home goods', day: 'TBA', month: 'IDEA', time: 'Date to be announced', category: 'Home & Living', stores: 'Participating stores to be announced', status: 'draft' },
      { title: 'Meet your next everyday ritual', day: 'TBA', month: 'IDEA', time: 'Date to be announced', category: 'Beauty', stores: 'Participating stores to be announced', status: 'draft' }
    ],
    faqs: [
      { q: 'What is the Store Discovery Community?', a: 'A private shopping community where people share what they are looking for and discover online stores, products, and offers. Selected stores can introduce themselves directly to members.' },
      { q: 'Who can join?', a: 'Shoppers who enjoy discovering new products and stores can join as members. Online stores can submit their information to be considered for a community introduction or virtual session.' },
      { q: 'Who are the shoppers?', a: 'They are community members with their own interests and shopping lists. Members choose what to share, and their interests help guide what the community explores.' },
      { q: 'How do you identify stores?', a: 'We review store submissions, products, categories, shipping details, and the interests members have shared. A submission is an opportunity to be considered, not a guarantee of selection.' },
      { q: 'How does a Store Discovery Event work?', a: 'A selected store introduces its brand and products in a virtual session. Members can hear the story, see featured products, and ask questions directly.' },
      { q: 'Can shoppers ask questions?', a: 'Yes. Sessions are designed for a real conversation. Shoppers can ask the store about products, materials, sizing, delivery, or anything else they want to know.' },
      { q: 'What information do stores need to provide?', a: 'We ask for a store link, product category, shipping locations, estimated delivery time, featured products, and any current offers. You can also tell us more about your brand.' },
      { q: 'Do stores need to ship internationally?', a: 'No. Stores can tell us the regions they serve. We share shipping details so shoppers can decide whether a store is right for them.' },
      { q: 'Do you guarantee sales?', a: 'No. We create opportunities for discovery and conversation. We do not guarantee sales, customers, revenue, conversions, or a particular commercial result.' },
      { q: 'How can I submit my store?', a: 'Use the store submission form on this page. We will review your information and contact you if there is a relevant opportunity to introduce your store.' },
      { q: 'How does the community grow?', a: 'Through active participation, member sharing, product discovery, and store participation. We do not promise a specific growth rate.' },
      { q: 'Are there costs associated with participating?', a: 'Participation details, including any costs, are shared directly with stores before a session or other opportunity. Submitting a store does not commit you to anything.' }
    ],
    submissions: [],
    members: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved ? { ...clone(defaults), ...saved } : clone(defaults);
    } catch (error) {
      return clone(defaults);
    }
  }

  function write(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('sdc:data-changed', { detail: data }));
    return data;
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return read();
  }

  function isLocalPreview() {
    return location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }

  async function load() {
    try {
      const response = await fetch('/api/content', { cache: 'no-store' });
      if (response.ok) return { ...clone(defaults), ...(await response.json()), submissions: [], members: [] };
    } catch (error) {
      if (!isLocalPreview()) return clone(defaults);
    }
    return read();
  }

  async function submit(endpoint, record) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (response.status === 404 && isLocalPreview()) return false;
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your request could not be saved.');
      return true;
    } catch (error) {
      if (isLocalPreview() && error instanceof TypeError) return false;
      throw error;
    }
  }

  window.SDCData = { defaults, read, write, reset, load, submit, storageKey: STORAGE_KEY };
})();
