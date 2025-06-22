import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>SimpleRAG Admin</h1>
      <nav>
        <ul>
          <li>
            <Link href="/users">User Management</Link>
          </li>
          <li>
            <Link href="/files">File Management</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
