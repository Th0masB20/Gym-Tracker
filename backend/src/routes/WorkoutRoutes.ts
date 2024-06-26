import express, { Request, Response, NextFunction } from 'express';
import { IReqVerification } from '../interfaces/IAuthorization';
import User from '../mongodb/models/User';
import { IWorkout, IWorkoutStartFinish, isWorkoutCorrect } from '../interfaces/IWorkout';

const workoutRoute = express.Router();

workoutRoute.post('/saveWorkout', async (req: Request, res: Response, next: NextFunction) => {
    const request: IReqVerification = req as IReqVerification;
    const newWorkoutJson: IWorkout = req.body as IWorkout;
    try {
        const user = await User.findById(request.token.id);
        if (!user) throw new Error('user DNE');

        if (!isWorkoutCorrect(newWorkoutJson)) {
            throw new Error('incorrect workout format');
        }

        for (let workouts of user.workouts) {
            if (workouts.workoutName === newWorkoutJson.workoutName) {
                throw new Error('workout exists');
            }
        }

        user.workouts.push(newWorkoutJson);
        for (let weekday of newWorkoutJson.calendarDay) {
            if (!user.weeklyCalendar[weekday]) {
                const calendar = { ...user.weeklyCalendar };
                calendar[weekday] = newWorkoutJson.workoutName;
                user.weeklyCalendar = calendar;
                continue;
            }
            else {
                throw new Error('day occupied');
            }
        }

        await user.save();
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});


workoutRoute.post('/finishWorkout', async (req: Request, res: Response, next: NextFunction) => {
    const request: IReqVerification = req as IReqVerification;
    const finishWorkoutJson: IWorkoutStartFinish = req.body as IWorkoutStartFinish;
    try {
        const user = await User.findById(request.token.id);
        if (!user) throw new Error('user DNE');
        const d = new Date();

        for (let i = 0; i < user.workouts.length; i++) {
            if (user.workouts[i].workoutName == finishWorkoutJson.workoutName) {
                user.workouts[i] = { ...user.workouts[i], previousWorkout: finishWorkoutJson };
                break;
            }
        }

        //finish workout has time attribute
        const history = { ...user.workoutHistory }
        if (!history[`${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`])
            history[`${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`] = []
        else {
            history[`${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`].push(finishWorkoutJson)
        }

        user.workoutHistory = {};
        user.workoutHistory = history
        user.activityLog[d.getMonth()] += 1;

        await user.save();
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});


workoutRoute.patch('/:name/updateWorkout', async (req: Request, res: Response, next: NextFunction) => {
    const param: { name: string } = req.params as { name: string };
    const request: IReqVerification = req as IReqVerification;
    const updatedWorkout: IWorkout = req.body as IWorkout;
    console.log('in here')
    try {
        const user = await User.findById(request.token.id);
        if (!user) throw new Error('user DNE');

        for (let i = 0; i < user.workouts.length; i++) {
            if (user.workouts[i].workoutName === param.name) {
                user.workouts[i] = updatedWorkout;
                break;
            }
        }

        const calendar = { ...user.weeklyCalendar };
        console.log(updatedWorkout.calendarDay)
        //add new entries
        for (let weekday of updatedWorkout.calendarDay) {
            if (!calendar[weekday]) {
                calendar[weekday] = updatedWorkout.workoutName;
                continue;
            }
            else {
                continue
            }
        }

        //remove days not in the new callendar
        for (let weekday in calendar) {
            if (calendar[weekday] == updatedWorkout.workoutName) {
                if (!updatedWorkout.calendarDay.includes(weekday)) {
                    calendar[weekday] = ''
                    continue;
                }
            }
        }
        user.weeklyCalendar = calendar;

        console.log(user.weeklyCalendar)
        await user.save();
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
})

workoutRoute.get('/:workoutName', async (req: Request, res: Response, next: NextFunction) => {
    const request: IReqVerification = req as IReqVerification;
    const params: { workoutName: string } = req.params as { workoutName: string };
    try {
        const user = await User.findById(request.token.id);
        if (!user) throw new Error('user DNE');
        let theWorkout: IWorkout | null = null;

        for (let workout of user.workouts) {
            if (workout.workoutName == params.workoutName) {
                theWorkout = workout;
                break;
            }
        }

        res.status(200).json(theWorkout);

    } catch (error) {
        next(error);
    }
});

workoutRoute.delete('/:workoutName/deleteWorkout', async (req: Request, res: Response, next: NextFunction) => {
    const request: IReqVerification = req as IReqVerification;
    const params: { workoutName: string } = req.params as { workoutName: string };

    try {
        const user = await User.findById(request.token.id);
        if (!user) throw new Error('user DNE');

        for (let i = 0; i < user.workouts.length; i++) {
            if (user.workouts[i].workoutName == params.workoutName) {
                for (let days of user.workouts[i].calendarDay) {
                    delete user.weeklyCalendar[days];
                }
                user.workouts.splice(i, 1);
                break;
            }

            if (i == user.workouts.length) {
                throw new Error('workout not found');
            }
        }

        await user.save();
        res.status(200).json(user);

    }
    catch (error) {
        next(error);
    }
});

//body is the IWorkoutStartFinish
workoutRoute.patch('/updatePreviousWorkout', async (req: Request, res: Response, next: NextFunction) => {
    const verRequest: IReqVerification = req as IReqVerification
    try {
        const user = await User.findById(verRequest.token.id);
        if (!user) throw new Error('user DNE');
        const userFinishedWorkout: IWorkoutStartFinish = req.body as IWorkoutStartFinish;

        user.previousWorkout = { ...userFinishedWorkout };
        await user.save();
        res.status(200).json(user)
    }
    catch (error) {
        next(error)
    }
})

export default workoutRoute;