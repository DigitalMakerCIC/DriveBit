
/**
  * Enumeration of motors.
  */
enum dbMotor
{
    //% block="motor 1"
    M1,
    //% block="motor 2"
    M2,
    //% block="both"
    Both
}

/**
  * Enumeration of forward/reverse directions
  */
enum dbDirection
{
    //% block="forward"
    Forward,
    //% block="reverse"
    Reverse
}

/**
  * Enumeration of directions.
  */
enum dbRobotDirection
{
    //% block="left"
    Left,
    //% block="right"
    Right
}

/**
  * Stop modes. Coast or Brake
  */
enum dbStopMode
{
    //% block="no brake"
    Coast,
    //% block="brake"
    Brake
}

/**
  * Pre-Defined LED colours
  */


/**
 * Custom blocks
 */

namespace DriveBit
{
    let leftBias = 0;
    let rightBias = 0;


// Motor Blocks

    function clamp(value: number, min: number, max: number): number
    {
        return Math.max(Math.min(max, value), min);
    }

    // slow PWM frequency for slower speeds to improve torque
    // only one PWM frequency available for all pins
    function setPWM(speed: number): void
    {
        if (speed < 200)
            pins.analogSetPeriod(AnalogPin.P12, 60000);
        else if (speed < 300)
            pins.analogSetPeriod(AnalogPin.P12, 40000);
        else
            pins.analogSetPeriod(AnalogPin.P12, 30000);
    }

    /**
      * Move both motors forward (or backward) at speed.
      * @param direction Move Forward or Reverse
      * @param speed speed of motor between 0 and 100. eg: 60
      */
    //% blockId="dbGo" block="go %direction|at speed %speed"
    //% speed.min=0 speed.max=100
    //% weight=100
    //% subcategory=Motors
    export function go(direction: dbDirection, speed: number): void
    {
        move(dbMotor.Both, direction, speed);
    }

    /**
      * Move both motors forward (or backward) at speed for milliseconds
      * @param direction Move Forward or Reverse
      * @param speed speed of motor between 0 and 100. eg: 60
      * @param milliseconds duration in milliseconds to drive forward for, then stop. eg: 400
      */
    //% blockId="dbGoms" block="go %direction|at speed %speed|for %milliseconds|(ms)"
    //% speed.min=0 speed.max=100
    //% weight=90
    //% subcategory=Motors
    export function goms(direction: dbDirection, speed: number, milliseconds: number): void
    {
        go(direction, speed);
        basic.pause(milliseconds);
        stop(dbStopMode.Coast);
    }

    /**
      * Rotate robot in direction at speed
      * @param direction direction to turn
      * @param speed speed of motors (0 to 100). eg: 60
      */
    //% blockId="dbRotate" block="spin %direction|at speed %speed"
    //% speed.min=0 speed.max=100
    //% weight=80
    //% subcategory=Motors
    export function rotate(direction: dbRobotDirection, speed: number): void
    {
        if (direction == dbRobotDirection.Left)
        {
            move(dbMotor.M1, dbDirection.Reverse, speed);
            move(dbMotor.M2, dbDirection.Forward, speed);
        }
        else if (direction == dbRobotDirection.Right)
        {
            move(dbMotor.M1, dbDirection.Forward, speed);
            move(dbMotor.M2, dbDirection.Reverse, speed);
        }
    }

    /**
      * Rotate robot in direction at speed for milliseconds.
      * @param direction direction to spin
      * @param speed speed of motor between 0 and 100. eg: 60
      * @param milliseconds duration in milliseconds to spin for, then stop. eg: 400
      */
    //% blockId="dbRotatems" block="spin %direction|at speed %speed|for %milliseconds|(ms)"
    //% speed.min=0 speed.max=100
    //% weight=70
    //% subcategory=Motors
    export function rotatems(direction: dbRobotDirection, speed: number, milliseconds: number): void
    {
        rotate(direction, speed);
        basic.pause(milliseconds);
        stop(dbStopMode.Coast);
    }

    /**
      * Stop robot by coasting slowly to a halt or braking
      * @param mode Brakes on or off
      */
    //% blockId=dbStop" block="stop with %mode"
    //% weight=60
    //% subcategory=Motors
    export function stop(mode: dbStopMode): void
    {
        let stopMode = 0;
        if (mode == dbStopMode.Brake)
            stopMode = 1;
        pins.digitalWritePin(DigitalPin.P14, stopMode);
        pins.digitalWritePin(DigitalPin.P15, stopMode);
        pins.digitalWritePin(DigitalPin.P12, stopMode);
        pins.digitalWritePin(DigitalPin.P13, stopMode);
    }

    /**
      * Move individual motors forward or reverse
      * @param motor motor to drive
      * @param direction select forwards or reverse
      * @param speed speed of motor between 0 and 100. eg: 60
      */
    //% blockId="dbMove" block="move %motor|motor(s) %direction|at speed %speed"
    //% weight=50
    //% speed.min=0 speed.max=100
    //% subcategory=Motors
    export function move(motor: dbMotor, direction: dbDirection, speed: number): void
    {
        speed = clamp(speed, 0, 100) * 10.23;
        setPWM(speed);
        let lSpeed = Math.round(speed * (100 - leftBias) / 100);
        let rSpeed = Math.round(speed * (100 - rightBias) / 100);
        if ((motor == dbMotor.M1) || (motor == dbMotor.Both))
        {
            if (direction == dbDirection.Forward)
            {
                pins.analogWritePin(AnalogPin.P12, lSpeed);
                pins.analogWritePin(AnalogPin.P13, 0);
            }
            else
            {
                pins.analogWritePin(AnalogPin.P12, 0);
                pins.analogWritePin(AnalogPin.P13, lSpeed);
            }
        }
        if ((motor == dbMotor.M2) || (motor == dbMotor.Both))
        {
            if (direction == dbDirection.Forward)
            {
                pins.analogWritePin(AnalogPin.P14, rSpeed);
                pins.analogWritePin(AnalogPin.P15, 0);
            }
            else
            {
                pins.analogWritePin(AnalogPin.P14, 0);
                pins.analogWritePin(AnalogPin.P15, rSpeed);
            }
        }
    }

    /**
      * Set left/right bias to match motors
      * @param direction direction to turn more (if robot goes right, set this to left)
      * @param bias percentage of speed to bias with eg: 10
      */
    //% blockId="dbBias" block="bias%direction|by%bias|%"
    //% bias.min=0 bias.max=80
    //% weight=40
    //% subcategory=Motors
    export function dbBias(direction: dbRobotDirection, bias: number): void
    {
        bias = clamp(bias, 0, 80);
        if (direction == dbRobotDirection.Left)
        {
            leftBias = bias;
            rightBias = 0;
        }
        else
        {
            leftBias = 0;
            rightBias = bias;
        }
    }

}
