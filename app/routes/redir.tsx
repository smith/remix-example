import { ActionFunction, Form, redirect } from "remix";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = formData.get("redir") ?? "/";
  return redirect(url);
};

export default function Redir() {
  return (
    <Form method="post">
      <input type="hidden" name="redir" value="https://www.google.com" />
      <input type="submit" value="Submit" />
    </Form>
  );
}
