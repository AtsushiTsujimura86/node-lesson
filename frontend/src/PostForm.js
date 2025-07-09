import React, {useState} from "react";

function PostForm() {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, message })
    });

    if (!res.ok) {
      console.error("Failed to post data");
      return;
    }

    const data = await res.json();
    console.log("response from server:", data);
    setResponse(data.message);
  };

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <input placeholder="input your name" onChange={(e)=>{setName(e.target.value)}}></input>
            <input placeholder="input message" onChange={(e)=>{setMessage(e.target.value)}}></input>
            <button type="submit">Submit</button>

            {response && <div>Response: {JSON.stringify(response)}</div>}
        </form>
    </div>
  );
}

export default PostForm;