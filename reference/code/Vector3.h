#ifndef VECTOR3_H
#define VECTOR3_H

#include <math.h>

class Vector3
{
public:
	// Components
	double x,y,z;

	// Length
	double norm() const;

	//------- Operators -------//
	Vector3		operator + (const Vector3 &other) const;
	Vector3 &	operator += (const Vector3 &other);
	Vector3		operator - (const Vector3 &other) const;
	Vector3 &	operator -= (const Vector3 &other);
	Vector3		operator - () const;
	double		operator * (const Vector3 &other) const;
	Vector3		operator * (const double scalar) const;
	Vector3 &	operator *= (const double scalar);
	Vector3		operator / (const double scalar) const;
	Vector3 &	operator /= (const double scalar);
	Vector3 &	operator = (const Vector3 &other);
	Vector3 &	operator = (const double &d);

	Vector3 cross (const Vector3 &other) const;
};

Vector3 rot_about(const Vector3 &v, const Vector3 &axis, const double theta);



/****************************
 * Inline functions
****************************/


inline Vector3 operator * (const double scalar, const Vector3 &vec)
{
	return vec * scalar;
}

// Length of a Vector3
inline double Vector3::norm() const
{
	return sqrt( x*x + y*y + z*z );
}


// Angle between two Vector3s
inline double angle(const Vector3 &v1, const Vector3 &v2)
{
	return acos(
			(v1*v2) / (v1.norm() * v2.norm())
			);
}

// Angle between a vector and a plane (identified by its normal)
// negative angle => v points "down" (away from normal)
// positive angle => v points "up" (same side of plane as normal)
inline double pl_vec_angle(const Vector3 &n, const Vector3 &v)
{
	return asin(
			(n*v) / (n.norm() * v.norm())
			);
}

// Orthogonal projection of vector "vect" onto vector "onto"
inline Vector3 oproj(const Vector3 &vect, const Vector3 &onto)
{
	// Gram-Schmidt
	return onto * ((onto*vect) / (onto*onto));
}

// Orthogonal projection of vector v onto a plane (defined by its normal n)
inline Vector3 pl_oproj(const Vector3 &v, const Vector3 &n)
{
	return v - oproj(v, n);
}


//===============
// Same as above, but assume the vectors are normalized
//===============

inline double angle_n(const Vector3 &v1, const Vector3 &v2)
{
	return acos(v1*v2);
}

inline double pl_vec_angle_n(const Vector3 &normal, const Vector3 &vect)
{
	return asin(normal*vect);
}

// Only "onto" needs to be normalized
inline Vector3 oproj_n(const Vector3 &vect, const Vector3 &onto)
{
	return onto * (onto*vect);
}

// Only n needs to be normalized
inline Vector3 pl_oproj_n(const Vector3 &v, const Vector3 &n)
{
	return v - oproj_n(v, n);
}

#endif
