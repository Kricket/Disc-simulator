/*
 * Frisbee.cpp
 *
 *  Started on: Sep 5, 2009
 *      Author: cid
 */

#include <math.h>
#include <GL/gl.h>
#include "Frisbee.h"

double Frisbee::D3_Z[FR_NUM_CONTOURS-1];

// Minimum time interval
const double MIN_DT		= 0.00001;

// The minimum length of velocity (linear or angular) to consider calculating it (avoids trembling)
const double MIN_NORM		= 0.001;

// World properties
const double GRAVITY		= 9.80665; // m/s^2
const double AIR_DENSITY	= 1.204; // ~20°C: kg/m^3
const double AIR_VISCOSITY	= 18.27; // ~15°C: kg/(ms) = Pa.s

// Aerodynamic coefficients
const double CL0			= -0.2;
const double CLalpha		= -2.96;
const double CD0			= 0.1;
const double CDalpha		= 3.0;
const double pCDalpha		= 4.0; // for positive angle-of-attack

// Inertia
const double Iz			= 0.00235; // kg*m^2
const double Ixy			= 0.00122; // kg*m^2

// elasticity and friction coefficients
const double MU_STATIC		= 0.9;
const double MU_DYN		= 0.4;

// Derived quantities
const double GRAV_MAG		= GRAVITY*FR_MASS;
const double alpha0		= -CL0 / CLalpha; // Should be ~ -4° = .06981317
const double FR_AREA		= M_PI * FR_RADIUS * FR_RADIUS;
const double FR_DIAM		= FR_RADIUS + FR_RADIUS;


//---------------------
// My lift constants
// These values are used to linearly vary lift, from 0 at alpha0
// to a max/min lift for pos/neg alpha, then back to 0 for |alpha| = pi/2

// negative alpha
const double Mn			= M_PI / (-2);//(alpha0 - M_PI/2) / 2;
const double CLnmax		= CL0 + CLalpha*Mn;
const double SLOPEn_L		= CLnmax / (Mn + M_PI/2);
const double Bn			= M_PI/2 * SLOPEn_L;

// positive alpha
const double Mp			= M_PI / 2;
const double CLpmax		= CL0 + CLalpha*Mp;
const double SLOPEp_L		= -CLpmax / (M_PI/2 - Mp);
const double Bp			= SLOPEp_L * M_PI / (-2);


//---------------------
// My torque quantities
// These values are used to linearly move the COP from the COG
// at |alpha| = pi/2, to max/min values for pos/neg alpha

const double AS		= -0.157079633;		// angle at which COP = COM (~ -9°)

// Negative alpha
const double nCOPmax	= FR_RADIUS / 20;			// Maximum center of pressure
const double nMID		= AS/2 - M_PI/4;			// alpha for max COP
const double nSLOPE	= nCOPmax / (AS - nMID);	// for convenience

// Positive alpha
const double pCOPmax	= FR_RADIUS / 10;			// max. center of pressure
const double pMID		= M_PI/4 + AS/2;			// alpha for max COP
const double pSLOPE	= pCOPmax / (pMID - AS);	// for convenience


// For debugging - delete this later
#include <stdio.h>
#include <stdlib.h>
void printv(Vector3 v, const char *name)
{
	printf("%s = %f, %f, %f\n", name, v.x, v.y, v.z);
}

Frisbee::Frisbee()
{
	reset();

	double normz, normx;

	for(long i = FR_NUM_CONTOURS - 1; i > 0; i--)
	{
		normz = FR_CONTOUR[i-1][1] - FR_CONTOUR[i][1];
		normx = FR_CONTOUR[i-1][0] - FR_CONTOUR[i][0];

		D3_Z[i-1] = normx / sqrt( normx*normx + normz*normz );
	}
}

void Frisbee::reset()
{
	d3.x = d3.y = 0;
	d3.z = 1;

	spinAngle = 0;
}



// Wrapper for update - having a too-large dt causes estimation erros that can spiral out of control
// Possible approaches:
// 1. while( dt > 0 ) ==> always round dt up to nearest multiple of MIN_DT
// 2. while( dt > MIN_DT ) == > always round dt down to nearest multiple of MIN_DT
// 3. while( dt > MIN_DT )...update(dt) ==> moves frisbee exactly dt
void Frisbee::move(double dt)
{
	// Update by MIN_DT each time
	while(dt > MIN_DT)
	{
		update(MIN_DT);
		dt -= MIN_DT;
	}
}



void Frisbee::update(double dt)
{
	static Vector3
		//flift, fdrag,	// Lift, drag forces
		//torque,		// Total torque (sum of moments) IN D1-D2 PLANE ONLY!
		//trad,			// vector from center to point of contact with ground
		//tvel,			// total velocity at point of contact
		tempv;			// temp
	static double
		alpha,		// Angle of attack (between frisbee plane and velocity
		planf_area,	// Area of disc facing direction of velocity
		vsq,		// Square of norm of velocity
		td1, td2;	// temporary
	static bool
		grounded;	// if the disc is on the ground


	//==================
	// Setup
	//==================

	ftotal.x = ftotal.y = torque.x = torque.y = torque.z = 0;
	ftotal.z = -GRAV_MAG;

	vsq = vel*vel;
	if(vsq == 0)
		alpha = 0;
	else
		alpha = pl_vec_angle(d3, vel);

	if(fabs(vel*d3) > 0.00001)
		d1 = pl_oproj_n(vel, d3);
	else
	{
		// Velocity is straight along the normal axis, so we just assign an arbitrary d1
		d1.x = d3.y;
		d1.y = d3.z;
		d1.z = d3.x;
		d1 = pl_oproj_n(d1, d3);
	}

	d1 /= d1.norm();
	d2 = d3.cross(d1);

	planf_area = FR_AREA * fabs(sin(alpha));
	// Add on some extra for the rim
	planf_area += (FR_HEIGHT*FR_RADIUS);


	//==================
	// Ground test
	//==================

	// this condition will usually not be satisfied, so it may save us some calculations
	grounded = false;
	if(pos.z < FR_RADIUS + FR_HEIGHT && vel.z < 0)
	{
		// Determine which contour point is the lowest (based on d3.z)
		register long i = FR_NUM_CONTOURS - 1;
		while( i >= 0 )
		{
			if(d3.z >= D3_Z[--i])
				break;
		}

		// now i = index in D3_Z of lowest contour point => FR_CONTOUR[i+1]

		td1 = sqrt(d3.x*d3.x + d3.y*d3.y); // length of horizontal component of d3

		trad = d3;
		trad.z = 0;
		trad *= d3.z / td1;
		trad.z = -td1;

		// Now, trad = d3 rotated 90° (so on disc plane, pointing towards lowest point)

		trad = trad * FR_CONTOUR[i+1][0] + d3 * FR_CONTOUR[i+1][1];

		if(trad.z + pos.z <= 0)
			grounded = true;
	}


	//==================
	// Drag
	//==================

	// Magnitude of Drag = 0.5 * rho * (v*v) * (planform area) * CD
	// CD = coeff of drag
	td1 = alpha - alpha0;
	td1 = CD0 + pCDalpha * (td1 * td1);

	td1 = AIR_DENSITY * sqrt(vsq) * planf_area * td1 * (-0.5);
	fdrag = vel * td1;


	//==================
	// Lift
	//==================

	// Magnitude of Lift = 0.5 * rho * (v*v) * (planform area) * CL
	// CL = coeff of lift
	// Direction of lift = perpendicular to velocity, in (vel, d3)-plane
	td1 = M_PI/2 + alpha;
	flift = d1*cos(td1) + d3*sin(td1);

	// Official calculation of CL - problem is, alpha=pi/2 => big lift
	td1 = CL0 + CLalpha*alpha;
/*
	// My calc of CL = mx + b, for different m, x
	if(alpha < Mn)
		td1 = SLOPEn_L*alpha + Bn;
	else if(alpha < Mp)
		td1 = CL0 + CLalpha*alpha;
	else
		td1 = SLOPEp_L*alpha + Bp;
//*/

	td1 = AIR_DENSITY * (vsq) * planf_area * td1 * (0.5);
	flift *= td1;


	//==================
	// Magnus force?
	//==================


	//==================
	// Sum of aerodynamic forces (plus gravity)
	//==================

	tempv = flift + fdrag;
	ftotal += tempv;


	//==================
	// Aerodynamic torque
	//==================

	// Variable COP based on alpha...
	if(alpha < nMID)
		td1 = nSLOPE * (alpha + M_PI/2);
	else if(alpha < AS)
		td1 = nSLOPE * (AS - alpha);
	else if(alpha < pMID)
		td1 = pSLOPE * (alpha - AS);
	else
		td1 = pSLOPE * (alpha - M_PI/2);

	torque += d1.cross(tempv) * td1;

	// Next: the spin creates a slight rolling torque..
	if(alpha < AS)
		//torqueN += .cross(d2) * vsq * dt / 30;
		torque += omega.cross(d2) * vsq / 3000000;
	else
		// When the frisbee is inverted, there's a stronger rolling torque (more friction with air?)
		torque += d2.cross(omega) * vsq / 500000;


	//==================
	// Ground effects
	//==================

	if(grounded)
	{
		// Set tv = total linear velocity at contact point
		tvel = vel + omega.cross(trad);

		if( tvel.z < 0 )
		{
			// Impulse force: resist force going into ground + resist velocity
			// new trick: the frisbee is flexible => reduce impulse force and deal with overlap?
			td2 = (-ftotal.z - vel.z * FR_MASS / dt) * 0.3;

			td1 = trad.z + pos.z;
			pos.z -= td1;	// cheating - keeping the friz aboveground
			//td2 += td1;

			//----- Apply impulse force -----//

			// linear
			ftotal.z += td2;
			// angular
			// need: trad.cross(td2 * z-axis)
			torque.x += trad.y * td2;
			torque.y -= trad.x * td2;

			//----- Calculate friction -----//

			// Friction = mu*td2, in direction -tvel
			td1 = tvel.norm();
			tempv = tvel / -td1;
			tempv.z = 0; // friction is only along the ground, not with it!

			if( td1 > MIN_NORM )
				tempv *= (td2 * MU_DYN);
			else
				tempv *= (td2 * MU_STATIC);

			//----- Apply friction -----//

			// linear
			ftotal += tempv;
			// angular
			torque += trad.cross(tempv);

			// Aaaand...if we're about upright, then slow down the spin
			if(d3.z > 0.999 || d3.z < -0.9)
				omega *= 0.9997;
		}
	}

	//==================
	// Update quantities
	//==================

	// decompose torque into parallel and perpendicular to d3
	//omega += torque * (dt / Iz);  <-- mis-calculates torque that affects spin
	tempv = oproj_n(torque, d3);
	omega += (tempv / Iz + (torque - tempv) / Ixy) * dt;

	// The spin slows down veeeeery slightly...
	//omega *= 0.9999972;

	// Apply rotation
	td2 = omega.norm();
	if(td2 > 0.001)
		d3 = rot_about(d3, omega, td2*dt);

	// Wobble damping: omega should move towards d3 a tiny bit...
	tempv = oproj_n(omega, d3);
	//omega += (tempv - omega) * (td2 * dt / 15);

	pos += vel*dt + ftotal * dt * dt / (2 * FR_MASS);
	vel += ftotal * dt / FR_MASS;

	// For pretty drawing...tu = d3-component of omega
	td2 = tempv.norm();
	if(td2 > 0)
	{
		if(omega*d3 < 0)
			spinAngle -= td2 * dt;
		else
			spinAngle += td2 * dt;

		while(spinAngle > 2*M_PI) spinAngle -= 2*M_PI;
		while(spinAngle < 0) spinAngle += 2*M_PI;
	}
}


void Frisbee::getNormalPreset(double *pos, double *vel, double *norm, double &omega)
{
	pos[0] = 0;
	pos[1] = 10.0;
	pos[2] = 1.2;

	vel[0] = 10.0;
	vel[1] = 0;
	vel[2] = 1;

	norm[0] = -0.3;
	norm[1] = 0;
	norm[2] = 1;

	omega = -40;
}
void Frisbee::getHammerPreset(double *pos, double *vel, double *norm, double &omega)
{
	pos[0] = 0;
	pos[1] = 10.0;
	pos[2] = 1.2;

	vel[0] = 10.0;
	vel[1] = 0;
	vel[2] = 10;

	norm[0] = 0.3;
	norm[1] = 1.0;
	norm[2] = -0.6;

	omega = 40;
}
void Frisbee::getKnifePreset(double *pos, double *vel, double *norm, double &omega)
{
	pos[0] = 0;
	pos[1] = 10.0;
	pos[2] = 1.2;

	vel[0] = 10.0;
	vel[1] = 0;
	vel[2] = 5.0;

	norm[0] = -0.1;
	norm[1] = 1.0;
	norm[2] = 0.2;

	omega = 40;
}
void Frisbee::getUpsideDownPreset(double *pos, double *vel, double *norm, double &omega)
{
	pos[0] = 0;
	pos[1] = 10.0;
	pos[2] = 1.2;

	vel[0] = 15.0;
	vel[1] = 0;
	vel[2] = 0;

	norm[0] = 0.2;
	norm[1] = 0.3;
	norm[2] = -1;

	omega = 40;
}
void Frisbee::getTossPreset(double *pos, double *vel, double *norm, double &omega)
{
	pos[0] = 0;
	pos[1] = 10.0;
	pos[2] = 1.2;

	vel[0] = 1.0;
	vel[1] = 0;
	vel[2] = 1;

	norm[0] = 0;
	norm[1] = 0;
	norm[2] = 1;

	omega = -20;
}
