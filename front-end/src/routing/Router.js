import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import EditProfile from "../components/Profile/EditProfile";
import RoomJoin from "../components/RoomJoin/RoomJoin";
import VideoCall from "../components/VideoCall/VideoCall";
import Home from "../pages/site/Home/Home";
import SiteRoot from "../pages/site/SiteRoot";

const Router=[{
    path:"/",
    element:<SiteRoot/>,

    children:[{
        path:"",
        element:<Home/>
    },
    {
        path:"/register",
        element:<Register/>
    },

    {
        path:"/login",
        element:<Login/>
    },

    {
        path:"/room",
        element:<RoomJoin/>
    },

    {
        path:"/video/:roomId",
        element:<VideoCall/>
    },
{
    path:"/profile",
    element:<EditProfile/>
}
   

]
}]

export default Router