import { useEffect } from "react";
import { useUser } from '@auth0/nextjs-auth0/client';
import VideoAudioProcessor from "../components/VideoAudioProcessor";
import Links from "../components/LinksBar";

const Index = (props) => {

  const { user } = useUser();

  const getVideos = async (sub) => {
    try {
      const res = await fetch(`http://localhost:5000/user_videos/${sub}`)
      const resJSON = await res.json()
      if (resJSON.videos) {
        props.setVideos(resJSON.videos)
      } else {
        console.log("There seem to be no videos associated sith this user")
      }
    } catch (error) {
      console.log("issue getting videos: ", error)
    }
  }

  const postNewUser = async (sub, pic) => {
    try {
      const res = await fetch(`api/postNewUser`, {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          user: sub,
          pic: pic,
          credits: 20
        })
      })
      const resJSON = await res.json()
      if (resJSON.data) {
        props.setCredits(resJSON.data.credits)
        props.setPic(resJSON.data.pic)
        getVideos(sub)
      } else {
        console.log("No Data in New User Response")
      }
    } catch (error) {
      console.log("issue sending new user to server: ", error)
    }
  }

  const getUser = async (sub, pic) => {
    try {
      const res = await fetch(`api/getThisUser/${sub}`)
      const resJSON = await res.json()
      console.log("get user res: ", resJSON)
      if (resJSON.data === null) {
        postNewUser(sub, pic)
      } else {
        props.setCredits(resJSON.data.credits)
        props.setPic(resJSON.data.pic)
        getVideos(sub)
      }
    } catch (error) {
      console.log("issue getting user: ", error)
    }
  }

  useEffect(() => {
    if (!user) return
    getUser(user.sub, user.picture)
  }, [user])

  return (
    <div className="container">

      <div className="smallwrapper">
        {props.videos && (
          <Links videos={props.videos} />
        )}
      </div>

      <div className="wrapper">
        {user && (
          <VideoAudioProcessor
            userSub={user.sub}
            getVideos={getVideos}
            credits={props.credits}
            setCredits={props.setCredits}
          />
        )}
      </div>

    </div>
  )
}

export default Index;