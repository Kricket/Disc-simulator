#include <cmath>
#include "Vector3.h"


/*************************************************************
 *
 * 		Operators
 *
*************************************************************/


Vector3 Vector3::operator + (const Vector3 &other) const
{
	Vector3 pv;
	pv.x = x + other.x;
	pv.y = y + other.y;
	pv.z = z + other.z;
	return pv;
}

Vector3& Vector3::operator +=(const Vector3 &other)
{
	x += other.x;
	y += other.y;
	z += other.z;

	return *this;
}

Vector3 Vector3::operator - (const Vector3 &other) const
{
	Vector3 pv;
	pv.x = x - other.x;
	pv.y = y - other.y;
	pv.z = z - other.z;
	return pv;
}

Vector3& Vector3::operator -= (const Vector3 &other)
{
	x -= other.x;
	y -= other.y;
	z -= other.z;

	return *this;
}

double Vector3::operator * (const Vector3 &other) const
{
	return x*other.x + y*other.y + z*other.z;
}

Vector3 Vector3::operator * (const double scalar) const
{
	Vector3 pv;
	pv.x = x*scalar;
	pv.y = y*scalar;
	pv.z = z*scalar;
	return pv;
}

Vector3& Vector3::operator *= (const double scalar)
{
	x *= scalar;
	y *= scalar;
	z *= scalar;

	return *this;
}

Vector3 Vector3::operator / (const double scalar) const
{
	Vector3 pv;
	pv.x = x/scalar;
	pv.y = y/scalar;
	pv.z = z/scalar;
	return pv;
}

Vector3& Vector3::operator /= (const double scalar)
{
	x /= scalar;
	y /= scalar;
	z /= scalar;

	return *this;
}

Vector3 Vector3::operator - () const
{
	Vector3 pv;
	pv.x = -x;
	pv.y = -y;
	pv.z = -z;
	return pv;
}

Vector3 Vector3::cross (const Vector3 &other) const
{
	Vector3 pv;
	pv.x = y*other.z - z*other.y;
	pv.y = z*other.x - x*other.z;
	pv.z = x*other.y - y*other.x;
	return pv;
}

Vector3& Vector3::operator = (const Vector3 &other)
{
	x = other.x;
	y = other.y;
	z = other.z;
	return (*this);
}

Vector3& Vector3::operator = (const double &d)
{
	x = y = z = d;
	return (*this);
}



/*************************************************************
 *
 * 		Other stuff
 *
*************************************************************/


Vector3 rot_about(const Vector3 &v, const Vector3 &axis, const double theta)
{
	Vector3 X, Y, Z, proj;

	proj = oproj(v, axis);
	X = v - proj;		// X has length (radius)
	Z = axis / axis.norm();
	Y = Z.cross(X);		// Y has length (radius)
	return (X*cos(theta) + Y*sin(theta)) + proj;
}


/*
// Length of a Vector3
double Vector3::norm() const
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
inline double pl_vec_angle(const Vector3 &normal, const Vector3 &vect)
{
	return asin(
			(normal*vect) / (normal.norm() * vect.norm())
			);
}

// Orthogonal projection of vector v onto vector u
inline Vector3 oproj(const Vector3 &u, const Vector3 &v)
{
	// Gram-Schmidt
	return u * ((u*v) / (v*v));
}

// Orthogonal projection of vector v onto a plane (defined by its normal n)
inline Vector3 pl_oproj(const Vector3 &v, const Vector3 &n)
{
	return v - n*((v*n) / (n*n));
}

// Same as above, but assume the vectors are normalized
inline double angle_n(const Vector3 &v1, const Vector3 &v2)
{
	return acos(v1*v2);
}

inline double pl_vec_angle_n(const Vector3 &normal, const Vector3 &vect)
{
	return asin(normal*vect);
}

// Only v needs to be normalized
inline Vector3 oproj_n(const Vector3 &u, const Vector3 &v)
{
	return u * (u*v);
}

// Only n needs to be normalized
inline Vector3 pl_oproj_n(const Vector3 &v, const Vector3 &n)
{
	return v - n*(v*n);
}
*/
