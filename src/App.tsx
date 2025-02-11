import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState<{ title: string; links: { text: string; href: string }[] } | null>(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/scrape")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>{data?.title}</h1>
      <ul>
        {data?.links.map((link, index) => (
          <li key={index}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">{link.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
