import { useEffect } from "react";
import VideoAudioProcessor from "../components/VideoAudioProcessor";
import { useUser } from '@auth0/nextjs-auth0/client';

const Index = (props) => {

  const { user } = useUser();

  const getVideos = async (sub) => {
    try {
      const res = await fetch(`http://localhost:5000/user_videos/${sub}`)
      const resJSON = await res.json()
      console.log("get user videos res: ", resJSON)
    } catch (error) {
      console.log("issue getting user: ", error)
    }
  }

  const postNewUser = async (sub) => {
    try {
      const res = await fetch(`api/postNewUser`, {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          user: sub,
          credits: 20
        })
      })
      const resJSON = await res.json()
      if (resJSON.data) {
        props.setCredits(resJSON.data.credits)
        getVideos(sub)
      } else {
        console.log("No Data in New User Response")
      }
    } catch (error) {
      console.log("issue sending new user to server: ", error)
    }
  }

  const getUser = async (sub) => {
    try {
      const res = await fetch(`api/getThisUser/${sub}`)
      const resJSON = await res.json()
      console.log("get user res: ", resJSON)
      if (resJSON.data === null) {
        postNewUser(sub)
      } else {
        props.setCredits(resJSON.data.credits)
        getVideos(sub)
      }
    } catch (error) {
      console.log("issue getting user: ", error)
    }
  }

  useEffect(() => {
    if (!user) return
    getUser(user.sub)
  }, [user])

  return (
    <div className="container">
      <div className="wrapper">
        {user && (
          <VideoAudioProcessor userSub={user.sub} />
        )}
      </div>
    </div>
  )
}

export default Index;