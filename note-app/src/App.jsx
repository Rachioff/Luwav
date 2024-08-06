import { useState } from "react";
import { createPlateUI, Plate, createPlugins } from '@udecode/plate-common';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createBoldPlugin } from '@udecode/plate-bold';
import { createItalicPlugin } from '@udecode/plate-italic';

const plugins = createPlugins([
    createParagraphPlugin(),
    createHeadingPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
]);

function App() {
    const [content, setContent] = useState([
    {
        type: 'p',
        children: [{ text: 'Hello, Tauri + React + Plate.js!' }],
    },
    ]);

    return (
    <div className="container">
        <h1>Welcome to Tauri!</h1>
        <Plate
        plugins={plugins}
        initialValue={content}
        onChange={newContent => {
            setContent(newContent);
            console.log(JSON.stringify(newContent));
        }}
        />
    </div>
    );
}

export default App;