import { type LoaderFunction, useLoaderData, useParams } from "remix";

export interface VillageData {
    name: string;
}


export default function Village() {
  const { name } = useParams();
  return (
    <div>
      <h1>Village {name}</h1>
      <p>This is the village page</p>
    </div>
  );
}
