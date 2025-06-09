// If gyro-script needs to be connected: activate strings with markers from COM01 to COM08
// import SplineWithGyro from "../Gyros/SplineWithGyro.tsx" // COM01
import Spline from "@splinetool/react-spline"

export default function App() {
    return (
        <Spline // change to SplineWithGyro in case of gyro-connection, to return to normal spline - change to Spline. COM02
            scene="https://prod.spline.design/M6PlSwhVF4ofVdRG/scene.splinecode?v=${Date.now()}
"
            // lightVarX="lightX" // your variables from Spline COM03
            // lightVarY="lightY" // your variables from Spline COM04
            // lightVarZ="lightZ" // your variables from Spline COM05
            // sensitivity={500} // movement sensitivity COM06
            // enableDesktopMouse={true} // enable mouse on desktop COM07
            // enableGyroscope={false} // on/off gyro-script entirely COM08
        />
    )
}
