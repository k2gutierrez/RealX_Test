export default function LegacyHome() {
  return null;
}

export function getServerSideProps() {
  return { redirect: { destination: "/", permanent: true } };
}
