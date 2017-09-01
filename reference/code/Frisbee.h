/*
 * Frisbee.h
 *
 *  Created on: Sep 5, 2009
 *      Author: cid
 */

#ifndef FRISBEE_H_
#define FRISBEE_H_

#include "Vector3.h"

//--- Physical properties -----------------------//

const double FR_MASS	= 0.175;	// kg
const double FR_RADIUS	= 0.1365;	// meters
const double FR_HEIGHT	= 0.025;	// meters


// --- For drawing...contour of the disc --------//
// FR_CONTOUR is an array of points, starting in the middle of the disc,
// and following the profile edge

const unsigned long FR_NUM_CONTOURS = 4;
const double FR_CONTOUR[FR_NUM_CONTOURS][2] =
{ { 0.7 * FR_RADIUS, 0 * FR_HEIGHT },
  { 0.95 * FR_RADIUS, -0.32 * FR_HEIGHT },
  { 1.0 * FR_RADIUS, -0.72 * FR_HEIGHT },
  { 0.98 * FR_RADIUS, -1.0 * FR_HEIGHT }
};


class Frisbee
{
public:
	Frisbee();

	// Calculate the movement of the disc after dt seconds
	void move(double dt);

	// Reset to "0"
	void reset();

	double spinAngle;	// angle of the disc around d3

	Vector3
		pos,		// Position
		vel,		// Velocity
		d3,			// Disc's normal axis
		omega;		// Angular velocity, in the N frame


	// The lowest point of the disc is contour point n if
	// d3.z >= D3_Z[n]
	// So loop (starting on LAST contour point = highest Z)
	static double D3_Z[FR_NUM_CONTOURS - 1];


	//---------------------------
	// Delete these later...
	static void getNormalPreset(double *pos, double *vel, double *norm, double &omega);
	static void getHammerPreset(double *pos, double *vel, double *norm, double &omega);
	static void getKnifePreset(double *pos, double *vel, double *norm, double &omega);
	static void getUpsideDownPreset(double *pos, double *vel, double *norm, double &omega);
	static void getTossPreset(double *pos, double *vel, double *norm, double &omega);
	Vector3 flift, fdrag, torque, ftotal, tvel, trad;

	// MAKE THESE PROTECTED later...
	// The rest of the disc's reference frame, at a given point in time
	// d1 is forward (dir. of velocity, projected onto disc plane), and d2 = d3 x d1 (i.e. to the left)
	Vector3 d2, d1;

protected:

	// Change state of the disc after dt seconds
	void update(double dt);
};

#endif /* FRISBEE_H_ */
