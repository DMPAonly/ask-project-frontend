import React from "react";
import Post from "./Post";
import axios from "axios";
import { useEffect, useState } from "react";
import QuestionForm from "./QuestionForm";
import AccountForm from "./AccountForm";
import AnswerPage from "./AnswerPage";
import HeaderQuestion from "./HeaderQuestion";
import Footer from "./Footer";
import HeadBar from "./HeadBar";
import { ThreeDots } from "react-loader-spinner";

function App(){
    //const API_URL = "http://localhost:3000";
    const API_URL = "https://ask-project-backend.onrender.com";

    const [posts, setPosts] = useState([]);
    const [answerResponse, setAnswerResponse] = useState([]);
    const [commentResponse, setCommnetResponse] = useState([]);
    const [sign, setSign] = useState(false);
    const [user, setUser] = useState("");
    const [clickShowAnswer, setClickShowAnswer] = useState(false);
    const [loading, setLoading] = useState(false);

    async function signIn(username, password){
        setLoading(true);
        try{
            const response = await axios.post(`${API_URL}/signIn`, {username, password});
            if(response.data === true){
                console.log(response.data);
                setSign(true);
                setUser(username);
            } else{
                alert("Wrong password");
            }
        } catch(error){
            alert("User does not exist");
        } finally{
            setLoading(false);
        }
    }

    async function signUp(email, username, password){
        setLoading(true);
        try{
            const response = await axios.post(`${API_URL}/signUp`, {email, username, password});
            if(response.data === true){
                console.log(response.data);
                setSign(true);
                setUser(username);
            } else if(response.data === 'Username is already taken.'){
                alert(response.data);
            } else{
                alert(response.data);
            }
        } catch(error){
            alert("Server Internal error");
        } finally{
            setLoading(false);
        }
    }

    async function fetchPosts(){
        try{
            const response = await axios.get(`${API_URL}/`);
            setPosts(response.data);
        } catch(error){
            console.error(error);
            alert("Cannot fetch posts");
        } 
    }

    async function addPosts(question){
        setLoading(true);
        try{
            const response = await axios.post(`${API_URL}/ask`, {question, user});
            console.log(question+", "+user);
            setPosts((prevPost) => {
                return [response.data, ...prevPost];
            });
            fetchPosts();
        } catch(error){
            console.error(error);
            alert("cannot add question");
        } finally{
            setLoading(false);
        }
    }

    async function addAnswer(answer, question_id){
        console.log(answer);
        console.log(question_id);
        setLoading(true);
        try{
            const response = await axios.post(`${API_URL}/answer/${question_id}`, {answer, user});
            console.log(response.data);
            if(response.data === "Sorry, You cannot answer your own question."){
                alert(response.data);
            } else{
                if(response.data === "You have already answered this question."){
                    alert(response.data);
                } else{
                    getAnswer(question_id);
                }
            }
        } catch(error){
            console.error(error);
            alert("Cannot add answer");
        } finally{
            setLoading(false);
        }
    }

    async function getAnswer(question_id){
        setLoading(true);
        try{
            const response = await axios.get(`${API_URL}/ask/${question_id}`);
            console.log(response.data);
            if(response.data.length === 0){
                alert("There is no answer for this question currently.");
            } else{
                setAnswerResponse(response.data);
                setClickShowAnswer(true);
            }
        } catch(error){
            console.error(error);
            alert("Cannot fetch answer");
        } finally{
            setLoading(false);
        }
    }

    async function addComment(comment, answer_id){
        setLoading(true);
        try{
            console.log(answer_id+" "+comment+" "+user);
            const response = await axios.post(`${API_URL}/comment/${answer_id}`, {comment, user});
            console.log(response.data);
            await getComment(answer_id);
        } catch(error){
            console.error(error);
            alert("Cannot add comment");
        } finally{
            setLoading(false);
        }
    }

    async function getComment(answer_id){
        setLoading(true);
        try{
            const response = await axios.get(`${API_URL}/comment/${answer_id}`);
            if(response.data.length === 0){
                alert("There are no comments on this answer currently.");
                setCommnetResponse([]);
            } else{
                setCommnetResponse(response.data);
                console.log(commentResponse);
            }
        } catch(error){
            console.error(error);
            alert("Cannot fetch comments");
        } finally{
            setLoading(false);
        }
    }

    function handleBack(){
        setClickShowAnswer(false);
    }

    function loggingOut(){
        setSign(false);
        setUser("");
    }

    useEffect(() => {
        fetchPosts();
    }, [sign]);

    return  <div>
                {loading && <div id="loading-dialog" style={sign ? {top: 70} : {top: 15}}><p>Loading <ThreeDots height={10} width={20} color="white"/></p></div>}
                {sign ? 
                <div className="flex-container">
                    <HeadBar user={user} logOut={loggingOut}/>
                    {!clickShowAnswer ? 
                    <div className="home-page">
                        <QuestionForm addPost={addPosts}/>
                        <br></br>
                        <hr></hr>
                        {posts.map((post) => {
                            return <Post 
                            key={post.question_id} 
                            id={post.question_id} 
                            question={post.question} 
                            author={post.author} 
                            handleAnswer={addAnswer} 
                            showAnswer={getAnswer}/>
                        })}
                    </div> : 
                    <div className="answer-page">
                        <button type="button" onClick={handleBack} className="secondary-btn">Back to Home</button>
                        <br></br>
                        <HeaderQuestion header={answerResponse}/>
                        {answerResponse.map((answer)=> {
                            return <AnswerPage 
                            key={answer.answer_id} 
                            id={answer.answer_id} 
                            answer={answer.answer} 
                            a_author={answer.a_author} 
                            handleCommentSubmit={addComment}
                            handleShowComment={getComment}
                            comments={commentResponse}/>
                        })}
                    </div>
                    }
                </div> :
                <AccountForm upSubmit={signUp} inSubmit={signIn} />
                }
                <Footer />
            </div>
}

export default App;